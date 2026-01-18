import React, { JSX, useState, ReactElement, useMemo, memo, useRef, useEffect } from 'react';
import {
  IConsultationSymptoms,
  IPatientSymptom,
  ISymptom,
  SymptomsType,
} from '@/types/consultation.interface';
import { ArrowRight, CornerDownRight, Loader2, Search } from 'lucide-react';
import { capitalize, cn } from '@/lib/utils';
import { Control, Controller, FieldPath, TriggerConfig, useFieldArray } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { useDebounce } from 'use-debounce';
import { Textarea } from '@/components/ui/textarea';
import { TooltipComp } from '@/components/ui/tooltip';

type FlyingItemData = {
  id: string;
  name: string;
  startRect: DOMRect;
  endRect: DOMRect;
  direction: 'toPatient' | 'toSystem';
};

type SelectSymptomsProps = {
  symptoms: ISymptom[];
  id: string;
  control: Control<IConsultationSymptoms>;
  trigger: (
    name?: FieldPath<IConsultationSymptoms> | FieldPath<IConsultationSymptoms>[],
    options?: TriggerConfig,
  ) => Promise<boolean>;
  selectedSymptoms: IPatientSymptom[];
};

const SelectSymptoms = memo(
  ({ symptoms, id, control, selectedSymptoms, trigger }: SelectSymptomsProps): JSX.Element => {
    const [systemSymptoms, setSystemSymptoms] = useState<ISymptom[]>(symptoms);
    const [flyingItem, setFlyingItem] = useState<FlyingItemData | null>(null);
    const [newlyAddedId, setNewlyAddedId] = useState<string | null>(null);
    const systemContainerRef = useRef<HTMLDivElement>(null);
    const patientContainerRef = useRef<HTMLDivElement>(null);

    // Move useFieldArray to component level
    const { append, remove } = useFieldArray({
      control,
      name: `symptoms.${id as SymptomsType}`,
    });

    useEffect(() => {
      if (newlyAddedId) {
        const timer = setTimeout(() => setNewlyAddedId(null), 500);
        return (): void => clearTimeout(timer);
      }
    }, [newlyAddedId]);

    const handleAddSymptom = (
      item: ISymptom | IPatientSymptom,
      buttonElement: HTMLElement,
    ): void => {
      const symptom = item as ISymptom;
      const startRect = buttonElement.getBoundingClientRect();
      const targetContainer = patientContainerRef.current;

      if (!targetContainer) {
        return;
      }

      const endRect = targetContainer.getBoundingClientRect();

      // Create flying animation
      setFlyingItem({
        id: symptom.id,
        name: symptom.name,
        startRect,
        endRect,
        direction: 'toPatient',
      });

      // Wait for animation to complete before updating state
      setTimeout(() => {
        const alreadySelected = selectedSymptoms.find((s) => s.name === symptom.name);
        if (!alreadySelected) {
          setSystemSymptoms((prev) => prev.filter((s) => s.id !== symptom.id));
          append({
            ...symptom,
            notes: '',
          });
          setNewlyAddedId(symptom.name); // Track the newly added symptom name
          void trigger();
        }
        setFlyingItem(null);
      }, 500);
    };

    const handleRemoveSymptom = (
      item: ISymptom | IPatientSymptom,
      buttonElement: HTMLElement,
    ): void => {
      const symptom = item as IPatientSymptom;
      const startRect = buttonElement.getBoundingClientRect();
      const targetContainer = systemContainerRef.current;

      if (!targetContainer) {
        return;
      }

      const endRect = targetContainer.getBoundingClientRect();

      // Create flying animation
      setFlyingItem({
        id: symptom.name,
        name: symptom.name,
        startRect,
        endRect,
        direction: 'toSystem',
      });

      // Wait for animation to complete before updating state
      setTimeout(() => {
        const symptomWithId: ISymptom = { ...symptom, id: symptom.name };
        const alreadyInSymptoms = systemSymptoms.find((s) => s.id === symptomWithId.id);
        if (!alreadyInSymptoms) {
          const symptomIndex = selectedSymptoms.findIndex((s) => s.name === symptom.name);
          if (symptomIndex !== -1) {
            remove(symptomIndex);
            void trigger();
            setSystemSymptoms((prev) => [symptomWithId, ...prev]);
          }
        }
        setFlyingItem(null);
      }, 500);
    };

    return (
      <div className="relative mt-6 flex flex-col gap-4 lg:flex-row lg:items-center">
        <SymptomsContainer
          ref={systemContainerRef}
          isLoading={false}
          id={id}
          symptoms={systemSymptoms}
          selectedSymptoms={selectedSymptoms}
          control={control}
          onSymptomAction={handleAddSymptom}
          newlyAddedId={newlyAddedId}
        />
        <div className="flex items-center justify-center lg:block">
          <ArrowRight className="h-6 w-6 rotate-90 text-gray-400 lg:rotate-0" />
        </div>
        <SymptomsContainer
          ref={patientContainerRef}
          isLoading={false}
          patientSymptoms
          id={id}
          symptoms={systemSymptoms}
          selectedSymptoms={selectedSymptoms}
          control={control}
          onSymptomAction={handleRemoveSymptom}
          newlyAddedId={newlyAddedId} // Pass newlyAddedId to SymptomsContainer
        />
        {flyingItem && <FlyingSymptom flyingItem={flyingItem} />}
      </div>
    );
  },
  (prevProps, nextProps) =>
    // Custom comparison function to prevent unnecessary re-renders
    prevProps.id === nextProps.id &&
    JSON.stringify(prevProps.symptoms) === JSON.stringify(nextProps.symptoms) &&
    JSON.stringify(prevProps.selectedSymptoms) === JSON.stringify(nextProps.selectedSymptoms),
);

SelectSymptoms.displayName = 'SelectSymptoms';

type SymptomsContainerProps = {
  isLoading: boolean;
  patientSymptoms?: boolean;
  symptoms?: ISymptom[];
  selectedSymptoms?: IPatientSymptom[];
  id: string;
  control: Control<IConsultationSymptoms>;
  onSymptomAction: (item: ISymptom | IPatientSymptom, element: HTMLElement) => void;
  newlyAddedId?: string | null;
};

const SymptomsContainer = React.forwardRef<HTMLDivElement, SymptomsContainerProps>(
  (
    {
      isLoading,
      patientSymptoms = false,
      symptoms = [],
      selectedSymptoms = [],
      control,
      id,
      onSymptomAction,
      newlyAddedId, // Destructure newlyAddedId
    },
    ref,
  ): ReactElement | null => {
    const [search, setSearch] = useState('');
    const [searchTerm] = useDebounce(search, 500);
    const searchedSymptoms = useMemo(
      () => symptoms.filter(({ name }) => name.toLowerCase().includes(searchTerm.toLowerCase())),
      [searchTerm, symptoms],
    );

    const emptyResults = (
      <div className="flex h-[200px] items-center justify-center text-xs text-gray-400 sm:text-sm">
        {patientSymptoms ? 'No symptoms selected so far' : 'No symptoms found'}
      </div>
    );

    const systemSymptomsList = searchedSymptoms.length
      ? searchedSymptoms.map((symptom, index) => (
          <SymptomItem
            key={symptom.id}
            item={symptom}
            id={id}
            index={index}
            control={control}
            onSymptomAction={onSymptomAction}
            patientSymptoms={false}
            newlyAddedId={newlyAddedId}
          />
        ))
      : emptyResults;

    const patientSelectedSymptoms = selectedSymptoms.length
      ? selectedSymptoms.map((symptom, index) => (
          <SymptomItem
            patientSymptoms={true}
            key={symptom.name}
            item={symptom}
            id={id}
            index={index}
            control={control}
            onSymptomAction={onSymptomAction}
            newlyAddedId={newlyAddedId}
          />
        ))
      : emptyResults;

    return (
      <div
        ref={ref}
        className={cn(
          'flex h-[350px] w-full flex-col gap-4 rounded-lg border border-gray-300 p-3 sm:p-4 lg:w-[370px]',
        )}
      >
        {isLoading ? (
          <div className="flex h-full items-center justify-center">
            <Loader2 className="animate-spin" />
          </div>
        ) : (
          <>
            <p className="text-sm leading-4 font-bold sm:text-base">
              {patientSymptoms ? 'Patient Symptoms' : `${capitalize(id)} Symptoms`}
            </p>
            <div
              className={cn('flex flex-col gap-2.5', patientSymptoms && 'h-full justify-between')}
            >
              <div className="relative flex h-[280px] flex-col gap-1 overflow-y-auto">
                {!patientSymptoms && (
                  <div className="sticky top-0 z-10 pb-2">
                    <Input
                      value={search}
                      onChange={({ target }) => setSearch(target.value)}
                      placeholder="Find symptoms"
                      leftIcon={<Search color="#8C96A5" size="18" />}
                    />
                  </div>
                )}
                {patientSymptoms ? patientSelectedSymptoms : systemSymptomsList}
              </div>
            </div>
          </>
        )}
      </div>
    );
  },
);

SymptomsContainer.displayName = 'SymptomsContainer';

type SymptomItemProps = {
  item: ISymptom | IPatientSymptom;
  id: string;
  patientSymptoms?: boolean;
  index: number;
  control: Control<IConsultationSymptoms>;
  onSymptomAction: (item: ISymptom | IPatientSymptom, element: HTMLElement) => void;
  newlyAddedId?: string | null;
};

const SymptomItem = ({
  item,
  id,
  patientSymptoms = false,
  index,
  control,
  onSymptomAction,
  newlyAddedId,
}: SymptomItemProps): ReactElement | null => {
  const [showNotes, setShowNotes] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const handleClick = ({ detail }: React.MouseEvent<HTMLButtonElement>): void => {
    // If clicking on patient symptom and notes are showing, toggle notes
    if (patientSymptoms && detail === 2) {
      setShowNotes((prev) => !prev);
    } else {
      // Single click moves the symptom
      if (buttonRef.current) {
        onSymptomAction(item, buttonRef.current);
      }
    }
  };

  return (
    <div>
      <button
        ref={buttonRef}
        type="button"
        onClick={handleClick}
        className={cn(
          'hover:border-primaryLightBase flex w-full flex-row items-center justify-between gap-2 rounded-md border border-gray-200 bg-white px-2 py-2 text-left duration-100 hover:bg-blue-50 sm:px-3 sm:py-2.5',
        )}
      >
        <p className="text-xs leading-[14px] sm:text-sm">{item.name}</p>
        {patientSymptoms && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setShowNotes((prev) => !prev);
            }}
            className={cn(
              'ml-auto rounded bg-gray-50 p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600',
              newlyAddedId === item.name && 'animate-shake',
            )}
          >
            <TooltipComp tip="Toggle notes">
              <CornerDownRight
                size={20}
                className={cn('transition-transform', showNotes && 'rotate-90')}
              />
            </TooltipComp>
          </button>
        )}
      </button>
      {patientSymptoms && showNotes && 'notes' in item && (
        <div
          className={cn(
            'overflow-hidden transition-all duration-300',
            showNotes ? 'max-h-44 opacity-100' : 'max-h-0 opacity-0',
          )}
        >
          <div className="mt-2 ml-2 flex gap-2 sm:ml-4">
            <div className="flex-shrink-0">
              <CornerDownRight className="h-6 w-6 text-gray-400 sm:h-8 sm:w-8" />
            </div>
            <Controller
              name={`symptoms.${id as SymptomsType}.${index}.notes`}
              control={control}
              render={({ field }) => (
                <Textarea
                  {...field}
                  placeholder={`Add notes on ${item.name.toLowerCase()}`}
                  className="min-h-[60px] text-xs sm:text-sm"
                />
              )}
            />
          </div>
        </div>
      )}
    </div>
  );
};

type FlyingSymptomProps = {
  flyingItem: FlyingItemData;
};

const FlyingSymptom = ({ flyingItem }: FlyingSymptomProps): ReactElement => {
  const [position, setPosition] = useState({
    left: flyingItem.startRect.left,
    top: flyingItem.startRect.top,
    width: flyingItem.startRect.width,
    height: flyingItem.startRect.height,
  });

  useEffect(() => {
    // Trigger animation after a brief delay
    const timer = setTimeout(() => {
      setPosition({
        left:
          flyingItem.endRect.left + flyingItem.endRect.width / 2 - flyingItem.startRect.width / 2,
        top:
          flyingItem.endRect.top + flyingItem.endRect.height / 2 - flyingItem.startRect.height / 2,
        width: flyingItem.startRect.width,
        height: flyingItem.startRect.height,
      });
    }, 10);

    return (): void => clearTimeout(timer);
  }, [flyingItem]);

  return (
    <div
      className="border-primaryLightBase pointer-events-none fixed z-50 flex items-center gap-2 rounded-md border bg-blue-100 px-2 py-2 shadow-lg transition-all duration-500 ease-in-out sm:px-3 sm:py-2.5"
      style={{
        left: `${position.left}px`,
        top: `${position.top}px`,
        width: `${position.width}px`,
        minHeight: `${position.height}px`,
      }}
    ></div>
  );
};

export default SelectSymptoms;
