'use client';
import { ChangeEvent, JSX, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Plus,
  Trash2,
  Search,
  BookOpen,
  PenLine,
  Send,
  FileText,
  ChevronRight,
  X,
  Eye,
  Link2,
  Check,
  CheckCircle2,
} from 'lucide-react';
import { useAppDispatch } from '@/lib/hooks';
import { IPagination } from '@/types/shared.interface';
import {
  createInvoice,
  getDoctorServices,
  sendInvoice,
  previewInvoicePdf,
  getInvoiceLink,
} from '@/lib/features/invoices/invoicesThunk';
import {
  IInvoiceLineItem,
  IDoctorService,
  IServiceInvoice,
  IInvoiceLinkResponse,
} from '@/types/invoice.interface';
import { generateUUID, ghcToPesewas, pesewasToGhc, showErrorToast } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';

type Step = 'form' | 'preview' | 'success';

interface CreateInvoiceModalProps {
  onSuccess: () => void;
  onCancel: () => void;
}

const CreateInvoiceModal = ({ onSuccess, onCancel }: CreateInvoiceModalProps): JSX.Element => {
  const dispatch = useAppDispatch();
  const [step, setStep] = useState<Step>('form');

  // Patient info
  const [patientName, setPatientName] = useState('');
  const [patientEmail, setPatientEmail] = useState('');

  // Line items
  const [lineItems, setLineItems] = useState<IInvoiceLineItem[]>([]);
  const [notes, setNotes] = useState('');

  // Catalog picker
  const [showCatalog, setShowCatalog] = useState(false);
  const [catalogServices, setCatalogServices] = useState<IDoctorService[]>([]);
  const [catalogSearch, setCatalogSearch] = useState('');
  const [catalogLoading, setCatalogLoading] = useState(false);

  // Submission
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createdInvoice, setCreatedInvoice] = useState<IServiceInvoice | null>(null);
  const [isPdfLoading, setIsPdfLoading] = useState(false);
  const [isLinkLoading, setIsLinkLoading] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);

  // ── Catalog ──────────────────────────────────────────────────────────────────
  async function openCatalog(): Promise<void> {
    setShowCatalog(true);
    setCatalogLoading(true);
    const { payload } = await dispatch(getDoctorServices({ pageSize: 50, isActive: true }));
    setCatalogLoading(false);
    if (!showErrorToast(payload)) {
      const { rows } = payload as IPagination<IDoctorService>;
      setCatalogServices(rows);
    }
  }

  function addFromCatalog(service: IDoctorService): void {
    const newItem: IInvoiceLineItem = {
      _id: generateUUID(),
      name: service.name,
      description: service.description ?? '',
      amount: pesewasToGhc(service.price).toFixed(2),
      serviceId: service.id,
    };
    setLineItems((prev) => [...prev, newItem]);
    setShowCatalog(false);
  }

  function addCustomItem(): void {
    const newItem: IInvoiceLineItem = {
      _id: generateUUID(),
      name: '',
      description: '',
      amount: '',
    };
    setLineItems((prev) => [...prev, newItem]);
  }

  function updateLineItem(id: string, field: keyof IInvoiceLineItem, value: string): void {
    setLineItems((prev) =>
      prev.map((item) => (item._id === id ? { ...item, [field]: value } : item)),
    );
  }

  function removeLineItem(id: string): void {
    setLineItems((prev) => prev.filter((item) => item._id !== id));
  }

  const totalGhs = lineItems.reduce((sum, item) => sum + (Number.parseFloat(item.amount) || 0), 0);

  // ── Validation ───────────────────────────────────────────────────────────────
  function getValidationError(): string | null {
    if (!patientName.trim()) {
      return 'Patient name is required.';
    }
    if (!patientEmail.trim()) {
      return 'Patient email is required.';
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(patientEmail.trim())) {
      return 'Enter a valid patient email.';
    }
    if (lineItems.length === 0) {
      return 'Add at least one line item.';
    }
    for (const item of lineItems) {
      if (!item.name.trim()) {
        return 'All line items must have a name.';
      }
      const amount = Number.parseFloat(item.amount);
      if (!item.amount || Number.isNaN(amount) || amount <= 0) {
        return 'All line items must have a valid amount greater than 0.';
      }
    }
    return null;
  }

  // ── Submission ────────────────────────────────────────────────────────────────
  async function submit(sendAfter: boolean): Promise<void> {
    const error = getValidationError();
    if (error) {
      toast({ title: 'Validation Error', description: error, variant: 'destructive' });
      return;
    }

    setIsSubmitting(true);

    const { payload: createPayload } = await dispatch(
      createInvoice({
        patientName: patientName.trim(),
        patientEmail: patientEmail.trim(),
        items: lineItems.map((item) => ({
          name: item.name.trim(),
          description: item.description.trim() || undefined,
          amount: ghcToPesewas(Number.parseFloat(item.amount)),
          serviceId: item.serviceId,
        })),
        notes: notes.trim() || undefined,
      }),
    );

    if (showErrorToast(createPayload)) {
      toast(createPayload as Parameters<typeof toast>[0]);
      setIsSubmitting(false);
      return;
    }

    const createdInvoice = createPayload as IServiceInvoice;

    if (sendAfter) {
      const { payload: sendPayload } = await dispatch(sendInvoice(createdInvoice.id));
      if (showErrorToast(sendPayload)) {
        toast(sendPayload as Parameters<typeof toast>[0]);
        setIsSubmitting(false);
        return;
      }
    }

    setCreatedInvoice(createdInvoice);
    setIsSubmitting(false);
    setStep('success');
  }

  async function handlePreviewPdf(): Promise<void> {
    if (!createdInvoice) {
      return;
    }
    setIsPdfLoading(true);
    const { payload } = await dispatch(previewInvoicePdf(createdInvoice.id));
    setIsPdfLoading(false);
    if (showErrorToast(payload)) {
      toast(payload as Parameters<typeof toast>[0]);
    }
  }

  async function handleCopyLink(): Promise<void> {
    if (!createdInvoice) {
      return;
    }
    setIsLinkLoading(true);
    const { payload } = await dispatch(getInvoiceLink(createdInvoice.id));
    setIsLinkLoading(false);
    if (showErrorToast(payload)) {
      toast(payload as Parameters<typeof toast>[0]);
      return;
    }
    const { paymentUrl } = payload as IInvoiceLinkResponse;
    await navigator.clipboard.writeText(paymentUrl);
    setLinkCopied(true);
    setTimeout(() => setLinkCopied(false), 2000);
  }

  const filteredCatalog = catalogServices.filter((s) =>
    s.name.toLowerCase().includes(catalogSearch.toLowerCase()),
  );

  // ── Success step ──────────────────────────────────────────────────────────────
  if (step === 'success' && createdInvoice) {
    return (
      <div className="flex flex-col items-center gap-6 py-4">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50">
          <CheckCircle2 size={36} className="text-emerald-500" />
        </div>

        <div className="text-center">
          <h3 className="text-lg font-bold text-gray-900">Invoice Created!</h3>
          <p className="mt-1 text-sm text-gray-500">
            Invoice{' '}
            <span className="font-mono font-semibold text-gray-800">
              {createdInvoice.reference}
            </span>{' '}
            has been created successfully.
          </p>
        </div>

        <div className="w-full space-y-2">
          <Button
            className="w-full"
            variant="outline"
            child={
              <span className="flex items-center justify-center gap-2">
                <Eye size={15} />
                Preview Invoice PDF
              </span>
            }
            onClick={handlePreviewPdf}
            isLoading={isPdfLoading}
          />
          <Button
            className="w-full"
            variant="outline"
            child={
              linkCopied ? (
                <span className="flex items-center justify-center gap-2 text-emerald-600">
                  <Check size={15} />
                  Link Copied!
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  <Link2 size={15} />
                  Copy Payment Link
                </span>
              )
            }
            onClick={handleCopyLink}
            isLoading={isLinkLoading}
            disabled={linkCopied}
          />
          <Button className="w-full" child="Done" onClick={onSuccess} />
        </div>
      </div>
    );
  }

  // ── Catalog picker overlay ────────────────────────────────────────────────────
  if (showCatalog) {
    let catalogContent;
    if (catalogLoading) {
      catalogContent = (
        <div className="flex items-center justify-center py-8 text-sm text-gray-400">
          Loading services…
        </div>
      );
    } else if (filteredCatalog.length === 0) {
      catalogContent = (
        <div className="py-8 text-center text-sm text-gray-400">No active services found.</div>
      );
    } else {
      catalogContent = (
        <div className="max-h-80 space-y-2 overflow-y-auto">
          {filteredCatalog.map((service) => (
            <button
              key={service.id}
              type="button"
              onClick={() => addFromCatalog(service)}
              className="hover:border-primary hover:bg-primary/5 flex w-full items-center justify-between rounded-lg border border-gray-200 px-4 py-3 text-left transition-colors"
            >
              <div>
                <p className="font-medium text-gray-900">{service.name}</p>
                {service.description && (
                  <p className="mt-0.5 line-clamp-1 text-xs text-gray-500">{service.description}</p>
                )}
              </div>
              <div className="flex items-center gap-2">
                <span className="text-primary font-semibold">
                  GHS {pesewasToGhc(service.price).toFixed(2)}
                </span>
                <ChevronRight size={16} className="text-gray-400" />
              </div>
            </button>
          ))}
        </div>
      );
    }

    return (
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-3">
          <button
            type="button"
            className="text-gray-500 hover:text-gray-700"
            onClick={() => setShowCatalog(false)}
          >
            <X size={20} />
          </button>
          <h3 className="font-semibold text-gray-900">Select from Service Catalog</h3>
        </div>
        <Input
          error=""
          placeholder="Search services…"
          leftIcon={<Search size={16} className="text-gray-400" />}
          value={catalogSearch}
          onChange={(e: ChangeEvent<HTMLInputElement>) => setCatalogSearch(e.target.value)}
        />
        {catalogContent}
      </div>
    );
  }

  // ── Preview step ──────────────────────────────────────────────────────────────
  if (step === 'preview') {
    return (
      <div className="flex flex-col gap-5">
        <div className="flex items-center gap-3">
          <button
            type="button"
            className="text-gray-500 hover:text-gray-700"
            onClick={() => setStep('form')}
          >
            <X size={20} />
          </button>
          <h3 className="font-semibold text-gray-900">Invoice Preview</h3>
        </div>

        <div className="space-y-5 rounded-xl border border-gray-200 p-5">
          {/* Patient */}
          <div>
            <p className="text-xs text-gray-400">Patient</p>
            <p className="font-semibold text-gray-800">{patientName}</p>
            <p className="text-sm text-gray-500">{patientEmail}</p>
          </div>

          {/* Items */}
          <div>
            <p className="mb-2 text-xs font-semibold tracking-wide text-gray-400 uppercase">
              Line Items
            </p>
            <div className="divide-y divide-gray-100 rounded-lg border border-gray-200">
              {lineItems.map((item) => (
                <div key={item._id} className="flex items-start justify-between px-4 py-3">
                  <div>
                    <p className="font-medium text-gray-800">{item.name}</p>
                    {item.description && (
                      <p className="mt-0.5 text-xs text-gray-500">{item.description}</p>
                    )}
                  </div>
                  <span className="font-semibold whitespace-nowrap text-gray-900">
                    GHS {Number.parseFloat(item.amount || '0').toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Total */}
          <div className="flex items-center justify-between rounded-lg bg-gray-50 px-4 py-3">
            <span className="font-semibold text-gray-700">Total Due</span>
            <span className="text-primary text-lg font-bold">GHS {totalGhs.toFixed(2)}</span>
          </div>

          {/* Notes */}
          {notes && (
            <div>
              <p className="mb-1 text-xs font-semibold tracking-wide text-gray-400 uppercase">
                Notes
              </p>
              <p className="text-sm text-gray-600">{notes}</p>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3">
          <Button
            variant="outline"
            child="Edit"
            onClick={() => setStep('form')}
            disabled={isSubmitting}
          />
          <Button
            variant="outline"
            child={
              <span className="flex items-center gap-2">
                <FileText size={15} />
                Save as Draft
              </span>
            }
            onClick={() => submit(false)}
            isLoading={isSubmitting}
          />
          <Button
            child={
              <span className="flex items-center gap-2">
                <Send size={15} />
                Create & Send
              </span>
            }
            onClick={() => submit(true)}
            isLoading={isSubmitting}
          />
        </div>
      </div>
    );
  }

  // ── Form step ─────────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col gap-5">
      {/* Patient info */}
      <div className="grid grid-cols-2 gap-3">
        <Input
          labelName={
            <>
              Patient Name <span className="text-red-500">*</span>
            </>
          }
          placeholder="e.g. Kwame Mensah"
          value={patientName}
          onChange={(e: ChangeEvent<HTMLInputElement>) => setPatientName(e.target.value)}
          error=""
        />
        <Input
          labelName={
            <>
              Patient Email <span className="text-red-500">*</span>
            </>
          }
          type="email"
          placeholder="e.g. kwame@example.com"
          value={patientEmail}
          onChange={(e: ChangeEvent<HTMLInputElement>) => setPatientEmail(e.target.value)}
          error=""
        />
      </div>

      {/* Line items */}
      <div>
        <div className="mb-2 flex items-center justify-between">
          <span className="text-sm font-medium text-gray-700">
            Line Items <span className="text-red-500">*</span>
          </span>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              child={
                <span className="flex items-center gap-1.5 text-xs">
                  <BookOpen size={13} />
                  From Catalog
                </span>
              }
              onClick={openCatalog}
              type="button"
            />
            <Button
              size="sm"
              variant="outline"
              child={
                <span className="flex items-center gap-1.5 text-xs">
                  <PenLine size={13} />
                  Custom Item
                </span>
              }
              onClick={addCustomItem}
              type="button"
            />
          </div>
        </div>

        {lineItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-gray-300 py-8 text-sm text-gray-400">
            <Plus size={24} className="mb-1 text-gray-300" />
            <p>Add items from your catalog or create custom items</p>
          </div>
        ) : (
          <div className="space-y-3">
            {lineItems.map((item, index) => (
              <div
                key={item._id}
                className="group rounded-lg border border-gray-200 bg-gray-50 p-3"
              >
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-xs font-medium text-gray-400">Item {index + 1}</span>
                  <button
                    type="button"
                    className="text-gray-300 transition-colors hover:text-red-500"
                    onClick={() => removeLineItem(item._id)}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <div className="col-span-2">
                    <input
                      className="border-input focus:border-primary h-9 w-full rounded-md border bg-white px-3 text-sm focus:outline-none"
                      placeholder="Service / item name *"
                      value={item.name}
                      onChange={(e) => updateLineItem(item._id, 'name', e.target.value)}
                    />
                  </div>
                  <div>
                    <div className="relative">
                      <span className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-xs text-gray-400">
                        GHS
                      </span>
                      <input
                        className="border-input focus:border-primary h-9 w-full rounded-md border bg-white pr-3 pl-10 text-sm focus:outline-none"
                        placeholder="0.00"
                        type="number"
                        min="0"
                        step="0.01"
                        value={item.amount}
                        onChange={(e) => updateLineItem(item._id, 'amount', e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="col-span-3">
                    <input
                      className="border-input focus:border-primary h-9 w-full rounded-md border bg-white px-3 text-sm focus:outline-none"
                      placeholder="Description (optional)"
                      value={item.description}
                      onChange={(e) => updateLineItem(item._id, 'description', e.target.value)}
                    />
                  </div>
                </div>
              </div>
            ))}

            {/* Total */}
            <div className="bg-primary/5 flex items-center justify-between rounded-lg px-4 py-3">
              <span className="text-sm font-semibold text-gray-700">Total</span>
              <span className="text-primary text-base font-bold">GHS {totalGhs.toFixed(2)}</span>
            </div>
          </div>
        )}
      </div>

      {/* Notes */}
      <Textarea
        labelName="Notes (optional)"
        placeholder="Add any additional notes for the patient…"
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        className="min-h-20"
        error=""
      />

      {/* Footer */}
      <div className="flex items-center justify-between border-t border-gray-100 pt-4">
        <Button variant="ghost" child="Cancel" onClick={onCancel} />
        <div className="flex gap-3">
          <Button
            variant="outline"
            child={
              <span className="flex items-center gap-2">
                <FileText size={15} />
                Preview Invoice
              </span>
            }
            onClick={() => {
              const error = getValidationError();
              if (error) {
                toast({ title: 'Validation Error', description: error, variant: 'destructive' });
                return;
              }
              setStep('preview');
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default CreateInvoiceModal;
