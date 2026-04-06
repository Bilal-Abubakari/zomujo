'use client';
import { JSX, SyntheticEvent, useEffect, useState } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { PaginationData, TableData } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Confirmation, ConfirmationProps, Modal } from '@/components/ui/dialog';
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
  Pencil,
  Trash2,
  ToggleLeft,
  ToggleRight,
  ArrowLeft,
} from 'lucide-react';
import { useAppDispatch } from '@/lib/hooks';
import { IPagination } from '@/types/shared.interface';
import { showErrorToast, pesewasToGhc, ghcToPesewas } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';
import { useSearch } from '@/hooks/useSearch';
import {
  getDoctorServices,
  createDoctorService,
  updateDoctorService,
  deleteDoctorService,
} from '@/lib/features/invoices/invoicesThunk';
import { IDoctorService } from '@/types/invoice.interface';
import Link from 'next/link';

type ServiceFormData = {
  name: string;
  price: string;
  description: string;
};

const EMPTY_FORM: ServiceFormData = { name: '', price: '', description: '' };

const Services = (): JSX.Element => {
  const dispatch = useAppDispatch();

  const [tableData, setTableData] = useState<IDoctorService[]>([]);
  const [paginationData, setPaginationData] = useState<PaginationData | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(false);
  const [queryParams, setQueryParams] = useState({ page: 1, pageSize: 10, search: '' });

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [editingService, setEditingService] = useState<IDoctorService | null>(null);
  const [formData, setFormData] = useState<ServiceFormData>(EMPTY_FORM);
  const [formError, setFormError] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const [confirmation, setConfirmation] = useState<ConfirmationProps>({
    acceptCommand: () => {},
    rejectCommand: () => {},
    description: '',
    open: false,
  });
  const [isConfirmationLoading, setIsConfirmationLoading] = useState(false);

  const { searchTerm, handleSearch } = useSearch(handleSearchSubmit);

  useEffect(() => {
    void fetchData();
  }, [queryParams]);

  async function fetchData(): Promise<void> {
    setIsLoading(true);
    const { payload } = await dispatch(getDoctorServices(queryParams));
    setIsLoading(false);
    if (payload && showErrorToast(payload)) {
      toast(payload as Parameters<typeof toast>[0]);
      return;
    }
    const { rows, ...pagination } = payload as IPagination<IDoctorService>;
    setTableData(rows);
    setPaginationData(pagination);
  }

  function handleSearchSubmit(event: SyntheticEvent<HTMLFormElement>, search?: string): void {
    event.preventDefault();
    setQueryParams((prev) => ({ ...prev, page: 1, search: search ?? searchTerm }));
  }

  function openCreateModal(): void {
    setEditingService(null);
    setFormData(EMPTY_FORM);
    setFormError('');
    setModalOpen(true);
  }

  function openEditModal(service: IDoctorService): void {
    setEditingService(service);
    setFormData({
      name: service.name,
      price: pesewasToGhc(service.price).toFixed(2),
      description: service.description ?? '',
    });
    setFormError('');
    setModalOpen(true);
  }

  async function handleSave(): Promise<void> {
    if (!formData.name.trim()) {
      setFormError('Service name is required.');
      return;
    }
    const priceGhs = Number.parseFloat(formData.price);
    if (!formData.price || Number.isNaN(priceGhs) || priceGhs <= 0) {
      setFormError('Please enter a valid price greater than 0.');
      return;
    }
    setFormError('');
    setIsSaving(true);

    let result;
    if (editingService) {
      result = await dispatch(
        updateDoctorService({
          id: editingService.id,
          payload: {
            name: formData.name.trim(),
            price: ghcToPesewas(priceGhs),
            description: formData.description.trim() || undefined,
          },
        }),
      );
    } else {
      result = await dispatch(
        createDoctorService({
          name: formData.name.trim(),
          price: ghcToPesewas(priceGhs),
          description: formData.description.trim() || undefined,
        }),
      );
    }

    toast(result.payload as Parameters<typeof toast>[0]);
    setIsSaving(false);

    if (!showErrorToast(result.payload)) {
      setModalOpen(false);
      void fetchData();
    }
  }

  function handleDelete(service: IDoctorService): void {
    setConfirmation({
      open: true,
      title: 'Delete Service',
      description: `Delete "${service.name}" from your service catalog? This cannot be undone.`,
      acceptButtonTitle: 'Delete',
      rejectButtonTitle: 'Cancel',
      acceptCommand: async () => {
        setIsConfirmationLoading(true);
        const { payload } = await dispatch(deleteDoctorService(service.id));
        setIsConfirmationLoading(false);
        setConfirmation((prev) => ({ ...prev, open: false }));
        toast(payload as Parameters<typeof toast>[0]);
        if (!showErrorToast(payload)) {
          void fetchData();
        }
      },
      rejectCommand: () => setConfirmation((prev) => ({ ...prev, open: false })),
    });
  }

  function handleToggleActive(service: IDoctorService): void {
    const willActivate = !service.isActive;
    setConfirmation({
      open: true,
      title: willActivate ? 'Activate Service' : 'Deactivate Service',
      description: willActivate
        ? `Activate "${service.name}"? It will become available to add to new invoices.`
        : `Deactivate "${service.name}"? It will be hidden from the catalog when creating invoices.`,
      acceptButtonTitle: willActivate ? 'Activate' : 'Deactivate',
      rejectButtonTitle: 'Cancel',
      acceptCommand: async () => {
        setIsConfirmationLoading(true);
        const { payload } = await dispatch(
          updateDoctorService({ id: service.id, payload: { isActive: willActivate } }),
        );
        setIsConfirmationLoading(false);
        setConfirmation((prev) => ({ ...prev, open: false }));
        toast(payload as Parameters<typeof toast>[0]);
        if (!showErrorToast(payload)) {
          void fetchData();
        }
      },
      rejectCommand: () => setConfirmation((prev) => ({ ...prev, open: false })),
    });
  }

  // NOSONAR
  const columns: ColumnDef<IDoctorService>[] = [
    {
      accessorKey: 'name',
      header: 'Name',
      cell: ({ row: { original } }) => (
        <span className="font-medium text-gray-900">{original.name}</span>
      ),
    },
    {
      accessorKey: 'price',
      header: 'Price (GHS)',
      cell: ({ row: { original } }) =>
        original.price === null ? (
          '—'
        ) : (
          <span className="font-semibold">GHS {pesewasToGhc(original.price).toFixed(2)}</span>
        ),
    },
    {
      accessorKey: 'description',
      header: 'Description',
      cell: ({ row: { original } }) => (
        <span className="line-clamp-1 text-sm text-gray-500">{original.description ?? '—'}</span>
      ),
    },
    {
      accessorKey: 'isActive',
      header: 'Status',
      cell: ({ row: { original } }) =>
        original.isActive ? (
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-700">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            {''}
            Active
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-500">
            <span className="h-1.5 w-1.5 rounded-full bg-gray-400" />
            {''}
            Inactive
          </span>
        ),
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row: { original } }) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <div className="flex w-10 cursor-pointer items-center justify-center">
              <Ellipsis size={18} />
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => openEditModal(original)}>
              <Pencil size={14} /> Edit
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleToggleActive(original)}>
              {original.isActive ? (
                <>
                  <ToggleLeft size={14} /> Deactivate
                </>
              ) : (
                <>
                  <ToggleRight size={14} /> Activate
                </>
              )}
            </DropdownMenuItem>
            <DropdownMenuItem
              className="text-red-600 focus:text-red-600"
              onClick={() => handleDelete(original)}
            >
              <Trash2 size={14} /> Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
      enableHiding: false,
    },
  ];

  return (
    <>
      <div className="mt-4 rounded-lg bg-white">
        <div className="p-6">
          {/* Header */}
          <div className="mb-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link href="/dashboard/invoices">
                <button
                  type="button"
                  className="flex h-8 w-8 items-center justify-center rounded-full border border-gray-200 text-gray-500 hover:bg-gray-50 hover:text-gray-700"
                >
                  <ArrowLeft size={16} />
                </button>
              </Link>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Service Catalog</h1>
                <p className="mt-0.5 text-sm text-gray-500">
                  Manage your reusable services and pricing
                </p>
              </div>
            </div>
            <Button
              child={
                <span className="flex items-center gap-2">
                  <Plus size={16} />
                  Add Service
                </span>
              }
              onClick={openCreateModal}
            />
          </div>

          {/* Search */}
          <div className="mb-4">
            <form className="flex" onSubmit={handleSearchSubmit}>
              <Input
                error=""
                placeholder="Search services…"
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

      {/* Create / Edit Modal */}
      <Modal
        open={modalOpen}
        setState={setModalOpen}
        showClose={true}
        title={editingService ? 'Edit Service' : 'Add Service'}
        description={
          editingService
            ? 'Update the service details below.'
            : 'Add a new service to your catalog.'
        }
        className="max-w-md"
        content={
          <div className="flex flex-col gap-4">
            <Input
              error=""
              labelName="Service Name *"
              placeholder="e.g. Abdominal Ultrasound"
              value={formData.name}
              onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
            />
            <div>
              <span className="mb-1.5 block text-sm font-medium text-gray-700">Price (GHS) *</span>
              <div className="relative max-w-sm">
                <span className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-sm text-gray-400">
                  GHS
                </span>
                <input
                  className="border-input focus:border-primary h-10 w-full rounded-md border pr-3 pl-12 text-sm focus:outline-none"
                  placeholder="0.00"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) => setFormData((prev) => ({ ...prev, price: e.target.value }))}
                />
              </div>
            </div>
            <Textarea
              labelName="Description (optional)"
              placeholder="Brief description of the service…"
              value={formData.description}
              onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
              error=""
            />
            {formError && <p className="text-sm text-red-500">{formError}</p>}
            <div className="flex justify-end gap-3 pt-2">
              <Button
                variant="outline"
                child="Cancel"
                onClick={() => setModalOpen(false)}
                disabled={isSaving}
              />
              <Button
                child={editingService ? 'Save Changes' : 'Add Service'}
                onClick={handleSave}
                isLoading={isSaving}
              />
            </div>
          </div>
        }
      />

      <Confirmation
        {...confirmation}
        showClose={!isConfirmationLoading}
        isLoading={isConfirmationLoading}
        setState={() => setConfirmation((prev) => ({ ...prev, open: false }))}
      />
    </>
  );
};

export default Services;
