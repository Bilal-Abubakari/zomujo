'use client';

import React, { JSX } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Copy, Share2, Download, ExternalLink } from 'lucide-react';
import QRCode from 'react-qr-code';

interface ShareQRSectionProps {
  url: string;
  copyToClipboard: () => Promise<void>;
  shareOnSocial: (platform: string) => void;
  downloadQRCode: () => Promise<void>;
}

export default function ShareQRSection({
  url,
  copyToClipboard,
  shareOnSocial,
  downloadQRCode,
}: Readonly<ShareQRSectionProps>): JSX.Element {
  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Share2 className="text-primary h-5 w-5" />
            Share Profile
          </CardTitle>
          <CardDescription>Share this profile with others or on social media</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center gap-2">
            <div className="flex-1 truncate rounded-md border bg-gray-50 px-3 py-2 text-sm text-gray-600">
              {url}
            </div>
            <Button
              variant="outline"
              size="icon"
              onClick={copyToClipboard}
              child={<Copy className="h-4 w-4" />}
              className="p-3"
            />
          </div>
          <Separator />
          <div>
            <p className="mb-3 text-sm font-medium text-gray-700">Share on Social Media</p>
            <div className="flex flex-wrap gap-3">
              <Button
                variant="outline"
                onClick={() => shareOnSocial('whatsapp')}
                className="hover:bg-green-50 hover:text-green-600"
                child="WhatsApp"
              />
              <Button
                variant="outline"
                onClick={() => shareOnSocial('twitter')}
                className="hover:bg-blue-50 hover:text-blue-400"
                child="Twitter"
              />
              <Button
                variant="outline"
                onClick={() => shareOnSocial('facebook')}
                className="hover:bg-blue-50 hover:text-blue-600"
                child="Facebook"
              />
              <Button
                variant="outline"
                onClick={() => shareOnSocial('linkedin')}
                className="hover:bg-blue-50 hover:text-blue-800"
                child="LinkedIn"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ExternalLink className="text-primary h-5 w-5" />
            Scan QR Code
          </CardTitle>
          <CardDescription>Scan to view this profile instantly on mobile</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center space-y-6">
          <div className="rounded-xl border bg-white p-4 shadow-sm">
            <QRCode
              id="DoctorProfileQRCode"
              value={url || 'https://zomujo.com'}
              size={160}
              level="H"
            />
          </div>
          <Button
            variant="outline"
            onClick={() => void downloadQRCode()}
            className="w-full max-w-xs"
            child={
              <span className="flex items-center">
                <Download className="mr-2 h-4 w-4" /> Download QR Card
              </span>
            }
          />
        </CardContent>
      </Card>
    </div>
  );
}
