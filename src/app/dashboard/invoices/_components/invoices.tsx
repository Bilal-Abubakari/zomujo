'use client';
import { JSX, ReactNode, SyntheticEvent, useEffect, useState } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { PaginationData, TableData } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Confirmation, ConfirmationProps, Modal } from '@/components/ui/dialog';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu';
import {
  Plus,
  Search,
  SendHorizontal,
  Ellipsis,
  Eye,
  Send,
  XCircle,
  Download,
  BookOpen,
  Link2,
  Check,
  FileText,
} from 'lucide-react';
import { useAppDispatch } from '@/lib/hooks';
import { IPagination, IQueryParams } from '@/types/shared.interface';
import { OrderDirection } from '@/types/shared.enum';
import { showErrorToast, pesewasToGhc, buildInvoicePaymentCopyText } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';
import { useSearch } from '@/hooks/useSearch';
import { InvoiceTab, useQueryParam } from '@/hooks/useQueryParam';
import {
  IServiceInvoice,
  ServiceInvoiceStatus,
  IInvoiceLinkResponse,
} from '@/types/invoice.interface';
import {
  getInvoices,
  sendInvoice,
  cancelInvoice,
  downloadInvoiceReceipt,
  previewInvoicePdf,
  getInvoiceLink,
} from '@/lib/features/invoices/invoicesThunk';
import InvoiceStatusBadge from '@/app/dashboard/invoices/_components/invoiceStatusBadge';
import CreateInvoiceModal from '@/app/dashboard/invoices/_components/createInvoiceModal';
import moment from 'moment';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const TAB_STATUS_MAP: Record<InvoiceTab, ServiceInvoiceStatus | ''> = {
  [InvoiceTab.All]: '',
  [InvoiceTab.Draft]: 'draft',
  [InvoiceTab.Sent]: 'sent',
  [InvoiceTab.Paid]: 'paid',
  [InvoiceTab.Cancelled]: 'cancelled',
};

const Invoices = (): JSX.Element => {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { updateQuery, getQueryParam } = useQueryParam();
  const activeTab = (getQueryParam('invoiceTab') as InvoiceTab) || InvoiceTab.All;

  const [tableData, setTableData] = useState<IServiceInvoice[]>([]);
  const [paginationData, setPaginationData] = useState<PaginationData | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [confirmation, setConfirmation] = useState<ConfirmationProps>({
    acceptCommand: () => {},
    rejectCommand: () => {},
    description: '',
    open: false,
  });
  const [queryParams, setQueryParams] = useState<IQueryParams<ServiceInvoiceStatus | ''>>({
    page: 1,
    pageSize: 10,
    search: '',
    status: '',
    orderDirection: OrderDirection.Descending,
    orderBy: 'createdAt',
  });

  const { searchTerm, handleSearch } = useSearch(handleSearchSubmit);

  useEffect(() => {
    setQueryParams((prev) => ({
      ...prev,
      page: 1,
      status: TAB_STATUS_MAP[activeTab],
    }));
  }, [activeTab]);

  useEffect(() => {
    const fetchData = async (): Promise<void> => {
      setIsLoading(true);
      const { payload } = await dispatch(getInvoices(queryParams));
      setIsLoading(false);
      if (payload && showErrorToast(payload)) {
        toast(payload);
        return;
      }
      const { rows, ...pagination } = payload as IPagination<IServiceInvoice>;
      setTableData(rows);
      setPaginationData(pagination);
    };
    void fetchData();
  }, [queryParams]);

  function handleSearchSubmit(event: SyntheticEvent<HTMLFormElement>, search?: string): void {
    event.preventDefault();
    setQueryParams((prev) => ({ ...prev, page: 1, search: search ?? searchTerm }));
  }

  async function handlePreviewPdf(invoice: IServiceInvoice): Promise<void> {
    setActionLoading(`pdf-${invoice.id}`);
    const { payload } = await dispatch(previewInvoicePdf(invoice.id));
    setActionLoading(null);
    if (showErrorToast(payload)) {
      toast(payload as Parameters<typeof toast>[0]);
    }
  }

  async function handleCopyLink(invoice: IServiceInvoice): Promise<void> {
    setActionLoading(`link-${invoice.id}`);
    const { payload } = await dispatch(getInvoiceLink(invoice.id));
    setActionLoading(null);
    if (showErrorToast(payload)) {
      toast(payload as Parameters<typeof toast>[0]);
      return;
    }
    const { paymentUrl } = payload as IInvoiceLinkResponse;
    const { firstName, lastName } = invoice.doctor;
    await navigator.clipboard.writeText(
      buildInvoicePaymentCopyText(paymentUrl, firstName, lastName),
    );
    setCopiedId(invoice.id);
    setTimeout(() => setCopiedId(null), 2000);
  }

  async function handleSend(invoice: IServiceInvoice): Promise<void> {
    setActionLoading(invoice.id);
    const { payload } = await dispatch(sendInvoice(invoice.id));
    setActionLoading(null);
    toast(payload as Parameters<typeof toast>[0]);
    if (!showErrorToast(payload)) {
      // Refresh table
      setQueryParams((prev) => ({ ...prev, page: prev.page }));
    }
  }

  async function handleDownloadReceipt(invoice: IServiceInvoice): Promise<void> {
    setActionLoading(invoice.id);
    const { payload } = await dispatch(
      downloadInvoiceReceipt({ id: invoice.id, reference: invoice.reference }),
    );
    setActionLoading(null);
    toast(payload as Parameters<typeof toast>[0]);
  }

  function handleCancel(invoice: IServiceInvoice): void {
    setConfirmation({
      open: true,
      title: 'Cancel Invoice',
      description: `Are you sure you want to cancel invoice ${invoice.reference}? This action cannot be undone.`,
      acceptButtonTitle: 'Yes, Cancel Invoice',
      rejectButtonTitle: 'Keep Invoice',
      acceptCommand: async () => {
        setConfirmation((prev) => ({ ...prev, open: false }));
        setActionLoading(invoice.id);
        const { payload } = await dispatch(cancelInvoice(invoice.id));
        setActionLoading(null);
        toast(payload as Parameters<typeof toast>[0]);
        if (!showErrorToast(payload)) {
          setQueryParams((prev) => ({ ...prev }));
        }
      },
      rejectCommand: () => setConfirmation((prev) => ({ ...prev, open: false })),
    });
  }

  const columns: ColumnDef<IServiceInvoice>[] = [
    {
      accessorKey: 'reference',
      header: 'Reference',
      cell: ({ row: { original } }) => (
        <span className="font-mono text-xs font-medium text-gray-700">{original.reference}</span>
      ), //NOSONAR
    },
    {
      accessorKey: 'patientName',
      header: 'Patient',
      cell: ({ row: { original } }): ReactNode => (
        <div>
          <p className="text-sm font-medium text-gray-800">{original.patientName}</p>
          <p className="text-xs text-gray-400">{original.patientEmail}</p>
        </div>
      ),
    },
    {
      accessorKey: 'totalAmount',
      header: 'Total (GHS)',
      cell: ({ row: { original } }) => (
        <span className="font-semibold">GHS {pesewasToGhc(original.totalAmount).toFixed(2)}</span>
      ),
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row: { original } }) => <InvoiceStatusBadge status={original.status} />, //NOSONAR
    },
    {
      accessorKey: 'createdAt',
      header: 'Date',
      cell: (
        { row: { original } }, //NOSONAR
      ) => (
        <span className="text-sm text-gray-500">
          {moment(original.createdAt).format('MMM D, YYYY')}
        </span>
      ),
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row: { original } }): ReactNode => {
        const isActing = actionLoading === original.id;
        const isCopied = copiedId === original.id;
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <div className="flex w-10 cursor-pointer items-center justify-center">
                <Ellipsis size={18} />
              </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => router.push(`/dashboard/invoices/${original.id}`)}>
                <Eye size={15} /> View
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => handlePreviewPdf(original)}
                disabled={actionLoading === `pdf-${original.id}`}
              >
                <FileText size={15} /> Preview PDF
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => handleCopyLink(original)}
                disabled={actionLoading === `link-${original.id}` || isCopied}
              >
                {isCopied ? (
                  <>
                    <Check size={15} className="text-emerald-600" />{' '}
                    <span className="text-emerald-600">Copied!</span>
                  </>
                ) : (
                  <>
                    <Link2 size={15} /> Copy Payment Link
                  </>
                )}
              </DropdownMenuItem>
              {original.status === 'draft' && (
                <DropdownMenuItem onClick={() => handleSend(original)} disabled={isActing}>
                  <Send size={15} /> Send to Patient
                </DropdownMenuItem>
              )}
              {(original.status === 'draft' || original.status === 'sent') && (
                <DropdownMenuItem
                  className="text-red-600 focus:text-red-600"
                  onClick={() => handleCancel(original)}
                  disabled={isActing}
                >
                  <XCircle size={15} /> Cancel Invoice
                </DropdownMenuItem>
              )}
              {original.status === 'paid' && (
                <DropdownMenuItem
                  onClick={() => handleDownloadReceipt(original)}
                  disabled={isActing}
                >
                  <Download size={15} /> Download Receipt
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
      enableHiding: false,
    },
  ];

  return (
    <>
      <div className="mt-4 rounded-lg bg-white">
        <div className="p-6">
          {/* Header */}
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-gray-900">Invoices</h1>
              <p className="mt-0.5 text-sm text-gray-500">Manage and track patient invoices</p>
            </div>
            <div className="flex items-center gap-2">
              <Link href="/dashboard/invoices/services">
                <Button
                  variant="outline"
                  child={
                    <span className="flex items-center gap-2">
                      <BookOpen size={16} />
                      <span className="hidden sm:inline">Service Catalog</span>
                    </span>
                  }
                />
              </Link>
              <Button
                child={
                  <span className="flex items-center gap-2">
                    <Plus size={16} />
                    New Invoice
                  </span>
                }
                onClick={() => setShowCreateModal(true)}
              />
            </div>
          </div>

          {/* Tabs */}
          <Tabs value={activeTab} className="mb-4">
            <TabsList className="h-auto flex-wrap gap-1">
              {Object.values(InvoiceTab).map((tab) => (
                <TabsTrigger
                  key={tab}
                  value={tab}
                  className="capitalize"
                  onClick={() => updateQuery('invoiceTab', tab)}
                >
                  {tab}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>

          {/* Search */}
          <div className="mb-4">
            <form className="flex" onSubmit={handleSearchSubmit}>
              <Input
                error=""
                placeholder="Search by reference or notes…"
                className="max-w-sm"
                type="search"
                leftIcon={<Search className="text-gray-500" size={18} />}
                onChange={handleSearch}
              />
              {searchTerm && <Button child={<SendHorizontal />} className="ml-2" />}
            </form>
          </div>

          {/* Table */}
          <TableData
            columns={columns}
            data={tableData}
            page={queryParams.page}
            userPaginationChange={({ pageIndex }) =>
              setQueryParams((prev) => ({ ...prev, page: pageIndex + 1 }))
            }
            paginationData={paginationData}
            isLoading={isLoading}
          />
        </div>
      </div>

      <Modal
        open={showCreateModal}
        setState={setShowCreateModal}
        showClose={true}
        title="Create Invoice"
        description="Create a new invoice for a patient"
        className="max-h-[90vh] max-w-2xl overflow-y-auto"
        content={
          <CreateInvoiceModal
            onSuccess={() => {
              setShowCreateModal(false);
              setQueryParams((prev) => ({ ...prev }));
            }}
            onCancel={() => setShowCreateModal(false)}
          />
        }
      />

      <Confirmation
        {...confirmation}
        showClose={true}
        setState={() => setConfirmation((prev) => ({ ...prev, open: false }))}
      />
    </>
  );
};

export default Invoices;
