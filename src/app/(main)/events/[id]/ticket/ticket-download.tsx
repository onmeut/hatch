"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Icons } from "@/components/icons";
import { toast } from "sonner";

interface TicketDownloadButtonProps {
  eventTitle: string;
  ticketCode: string;
}

export function TicketDownloadButton({
  eventTitle,
  ticketCode,
}: TicketDownloadButtonProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleDownload = async () => {
    setIsLoading(true);

    try {
      // Get the ticket content element
      const ticketElement = document.getElementById("ticket-content");
      if (!ticketElement) {
        toast.error("خطا در دانلود بلیط");
        return;
      }

      // Use html2canvas to capture the ticket
      const html2canvas = (await import("html2canvas")).default;
      
      // Suppress warnings for unsupported color functions
      const originalWarn = console.warn;
      console.warn = (...args) => {
        if (typeof args[0] === 'string' && args[0].includes('unsupported color')) {
          return;
        }
        originalWarn.apply(console, args);
      };

      const canvas = await html2canvas(ticketElement, {
        scale: 2,
        useCORS: true,
        backgroundColor: "#171717", // neutral-900 in hex
        logging: false,
        onclone: (clonedDoc) => {
          // Apply hex fallback colors to cloned document for better compatibility
          const clonedElement = clonedDoc.getElementById("ticket-content");
          if (clonedElement) {
            clonedElement.style.backgroundColor = "#171717";
            clonedElement.style.color = "#fafafa";
          }
        },
      });

      // Restore console.warn
      console.warn = originalWarn;

      // Convert to blob and download
      canvas.toBlob((blob) => {
        if (!blob) {
          toast.error("خطا در ساخت تصویر");
          return;
        }

        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `ticket-${ticketCode}-${eventTitle.slice(0, 20)}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

        toast.success("بلیط دانلود شد! 🎉");
      }, "image/png");
    } catch (error) {
      console.error("Download error:", error);
      toast.error("خطا در دانلود بلیط");
    } finally {
      setIsLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="flex gap-2 flex-1">
      <Button
        onClick={handleDownload}
        disabled={isLoading}
        className="flex-1"
      >
        {isLoading ? (
          <>
            <Icons.Clock4 className="h-4 w-4 ml-2 animate-spin" />
            صبر کن...
          </>
        ) : (
          <>
            <Icons.Ticket className="h-4 w-4 ml-2" />
            دانلود بلیط
          </>
        )}
      </Button>
      <Button variant="outline" onClick={handlePrint}>
        <Icons.Rocket className="h-4 w-4" />
      </Button>
    </div>
  );
}

