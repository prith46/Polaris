import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import { readFileSync, existsSync, readdirSync } from 'fs';
import { resolve } from 'path';
import App from '../src/App';

describe('Screenshot-based Testing', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  let screenshotsDir = resolve(__dirname, '../screenshots');
  if (!existsSync(screenshotsDir)) {
    screenshotsDir = resolve(__dirname, '../screenshot');
  }

  if (!existsSync(screenshotsDir)) {
    test.skip('Skipping screenshot tests because /screenshots folder does not exist', () => {});
  } else {
    const files = readdirSync(screenshotsDir).filter(f => 
      f.endsWith('.png') || f.endsWith('.jpg') || f.endsWith('.webp')
    );

    if (files.length === 0) {
      test.skip('No screenshot files found — add images to /screenshots folder to test', () => {});
    } else {
      files.forEach((filename) => {
        test(`Scans image file: ${filename}`, async () => {
          const filePath = resolve(screenshotsDir, filename);
          const fileBuffer = readFileSync(filePath);
          const base64 = fileBuffer.toString('base64');
          
          let mimeType = 'image/png';
          if (filename.endsWith('.jpg') || filename.endsWith('.jpeg')) {
            mimeType = 'image/jpeg';
          } else if (filename.endsWith('.webp')) {
            mimeType = 'image/webp';
          }

          const mockResponse = {
            tasks: [{ title: "Test task", deadline: "Tomorrow", urgency: "high" }]
          };

          const mockFetch = vi.spyOn(global, 'fetch').mockResolvedValue({
            ok: true,
            json: async () => mockResponse,
          } as Response);

          render(<App />);

          // Open scan image modal from Tasks tab
          fireEvent.click(screen.getByRole('button', { name: /Scan image/i }));

          // Upload the file
          const file = new File([fileBuffer], filename, { type: mimeType });
          const fileInput = screen.getByTestId('image-file-input');
          fireEvent.change(fileInput, { target: { files: [file] } });

          // Wait for preview to render
          await waitFor(() => {
            expect(screen.getByAltText('Selected preview')).toBeInTheDocument();
          });

          // Verify no type/size error shown
          expect(screen.queryByText('Please upload a PNG, JPG, or WEBP image.')).not.toBeInTheDocument();
          expect(screen.queryByText('File too large — please use an image under 10MB.')).not.toBeInTheDocument();

          // Scan the image
          fireEvent.click(screen.getByRole('button', { name: 'Scan for tasks' }));

          // Verify scan result renders correctly
          await waitFor(() => {
            expect(screen.getByText('✓ Found 1 task(s) — added to your Tasks.')).toBeInTheDocument();
          });

          mockFetch.mockRestore();
        });
      });
    }
  }
});
