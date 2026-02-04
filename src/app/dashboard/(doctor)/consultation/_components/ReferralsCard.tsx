import React, { JSX } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Share2, User, Building2, Trash2 } from 'lucide-react';
import { IReferral } from '@/types/consultation.interface';
import { Button } from '@/components/ui/button';

interface ReferralsCardProps {
  referrals: IReferral[];
  onRemove?: (index: number) => void;
}

export const ReferralsCard = ({ referrals, onRemove }: ReferralsCardProps): JSX.Element => (
  <Card>
    <CardHeader>
      <CardTitle className="flex items-center justify-between text-lg">
        <div className="flex items-center gap-2">
          <Share2 className="text-primary h-5 w-5" />
          Referrals
        </div>
        {referrals && referrals.length > 0 && (
          <Badge variant="secondary" className="px-2 py-1">
            {referrals.length} {referrals.length === 1 ? 'Referral' : 'Referrals'}
          </Badge>
        )}
      </CardTitle>
    </CardHeader>
    <CardContent className="w-full">
      {referrals && referrals.length > 0 ? (
        <div className="space-y-3">
          {referrals.map((referral, index) => (
            <div
              key={index}
              className="flex flex-col gap-2 rounded-lg border bg-white p-3 shadow-sm"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <Badge
                    variant={referral.type === 'internal' ? 'default' : 'outline'}
                    className="text-xs uppercase"
                  >
                    {referral.type}
                  </Badge>
                  {referral.type === 'internal' && referral.doctor ? (
                    <span className="text-sm font-semibold">
                      Dr. {referral.doctor.firstName} {referral.doctor.lastName}
                    </span>
                  ) : (
                    <span className="text-sm font-semibold">{referral.doctorName}</span>
                  )}
                </div>
                {onRemove && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onRemove(index)}
                    className="h-6 w-6 p-0 text-red-500 hover:text-red-600"
                    child={<Trash2 size={14} />}
                  />
                )}
              </div>

              <div className="space-y-1 text-sm text-gray-600">
                {referral.type === 'internal' && referral.doctor ? (
                  <>
                    <div className="flex items-center gap-2">
                      <Building2 size={12} />{' '}
                      {/* <span>{referral.doctor.hospital?.name || 'Zomujo Platform'}</span> */}
                      <span>{'Zomujo Platform'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <User size={12} />{' '}
                      <span>{referral.doctor.specializations?.[0] || 'General Practitioner'}</span>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex items-center gap-2">
                      <Building2 size={12} /> <span>{referral.facility}</span>
                    </div>
                    {referral.email && (
                      <div className="text-xs text-gray-400">Email: {referral.email}</div>
                    )}
                    {referral.notes && (
                      <div className="mt-1 text-xs italic">&quot;{referral.notes}&quot;</div>
                    )}
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-gray-500">No referrals added</p>
      )}
    </CardContent>
  </Card>
);
