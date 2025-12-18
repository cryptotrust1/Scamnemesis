/**
 * ClamAV Virus Scanning Service
 * Provides virus scanning capabilities for uploaded files
 */

import net from 'net';

// ClamAV configuration
const CLAMAV_HOST = process.env.CLAMAV_HOST || 'localhost';
const CLAMAV_PORT = parseInt(process.env.CLAMAV_PORT || '3310');
const SCAN_TIMEOUT = 30000; // 30 seconds timeout

export interface ScanResult {
  isClean: boolean;
  virusName?: string;
  error?: string;
  scannedAt: Date;
}

/**
 * Check if ClamAV service is available
 */
export async function isClamAVAvailable(): Promise<boolean> {
  return new Promise((resolve) => {
    const socket = new net.Socket();
    const timeout = setTimeout(() => {
      socket.destroy();
      resolve(false);
    }, 5000);

    socket.connect(CLAMAV_PORT, CLAMAV_HOST, () => {
      clearTimeout(timeout);
      socket.write('PING\0');
    });

    socket.on('data', (data) => {
      clearTimeout(timeout);
      socket.destroy();
      resolve(data.toString().trim() === 'PONG');
    });

    socket.on('error', () => {
      clearTimeout(timeout);
      socket.destroy();
      resolve(false);
    });
  });
}

/**
 * Scan a file buffer for viruses using ClamAV
 * Uses the INSTREAM protocol for streaming data to clamd
 */
export async function scanBuffer(buffer: Buffer): Promise<ScanResult> {
  return new Promise((resolve) => {
    const socket = new net.Socket();
    let responseData = '';

    const timeout = setTimeout(() => {
      socket.destroy();
      resolve({
        isClean: false,
        error: 'Scan timeout exceeded',
        scannedAt: new Date(),
      });
    }, SCAN_TIMEOUT);

    socket.connect(CLAMAV_PORT, CLAMAV_HOST, () => {
      // Send INSTREAM command
      socket.write('zINSTREAM\0');

      // Send data in chunks (max 2KB each as per ClamAV protocol)
      const CHUNK_SIZE = 2048;
      let offset = 0;

      while (offset < buffer.length) {
        const chunk = buffer.subarray(offset, Math.min(offset + CHUNK_SIZE, buffer.length));
        const sizeBuffer = Buffer.alloc(4);
        sizeBuffer.writeUInt32BE(chunk.length, 0);
        socket.write(sizeBuffer);
        socket.write(chunk);
        offset += CHUNK_SIZE;
      }

      // Send zero-length chunk to indicate end of stream
      const endBuffer = Buffer.alloc(4);
      endBuffer.writeUInt32BE(0, 0);
      socket.write(endBuffer);
    });

    socket.on('data', (data) => {
      responseData += data.toString();
    });

    socket.on('end', () => {
      clearTimeout(timeout);
      socket.destroy();

      const response = responseData.trim();

      // Parse ClamAV response
      // Format: "stream: OK" or "stream: <virus_name> FOUND"
      if (response.includes('OK')) {
        resolve({
          isClean: true,
          scannedAt: new Date(),
        });
      } else if (response.includes('FOUND')) {
        // Extract virus name
        const match = response.match(/stream:\s*(.+)\s+FOUND/);
        const virusName = match ? match[1].trim() : 'Unknown threat';
        resolve({
          isClean: false,
          virusName,
          scannedAt: new Date(),
        });
      } else if (response.includes('ERROR')) {
        resolve({
          isClean: false,
          error: `ClamAV error: ${response}`,
          scannedAt: new Date(),
        });
      } else {
        resolve({
          isClean: false,
          error: `Unexpected response: ${response}`,
          scannedAt: new Date(),
        });
      }
    });

    socket.on('error', (err) => {
      clearTimeout(timeout);
      socket.destroy();
      resolve({
        isClean: false,
        error: `Connection error: ${err.message}`,
        scannedAt: new Date(),
      });
    });
  });
}

/**
 * Scan a file from S3/MinIO by streaming it through ClamAV
 * Returns the scan result
 */
export async function scanFileFromUrl(url: string): Promise<ScanResult> {
  try {
    // Fetch the file
    const response = await fetch(url);
    if (!response.ok) {
      return {
        isClean: false,
        error: `Failed to fetch file: ${response.status}`,
        scannedAt: new Date(),
      };
    }

    const buffer = Buffer.from(await response.arrayBuffer());
    return scanBuffer(buffer);
  } catch (error) {
    return {
      isClean: false,
      error: `Fetch error: ${error instanceof Error ? error.message : 'Unknown error'}`,
      scannedAt: new Date(),
    };
  }
}

/**
 * Get ClamAV version information
 */
export async function getClamAVVersion(): Promise<string | null> {
  return new Promise((resolve) => {
    const socket = new net.Socket();

    const timeout = setTimeout(() => {
      socket.destroy();
      resolve(null);
    }, 5000);

    socket.connect(CLAMAV_PORT, CLAMAV_HOST, () => {
      socket.write('VERSION\0');
    });

    socket.on('data', (data) => {
      clearTimeout(timeout);
      socket.destroy();
      resolve(data.toString().trim());
    });

    socket.on('error', () => {
      clearTimeout(timeout);
      socket.destroy();
      resolve(null);
    });
  });
}

export const clamavService = {
  isClamAVAvailable,
  scanBuffer,
  scanFileFromUrl,
  getClamAVVersion,
};
