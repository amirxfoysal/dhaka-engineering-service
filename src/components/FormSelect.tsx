import { useEffect, useId, useRef, useState, type ReactNode } from 'react';
import { Check, ChevronDown } from 'lucide-react';
import './FormSelect.css';

export type FormSelectOption = {
  value: string;
  label: string;
};

type FormSelectBase = {
  label: string;
  icon: ReactNode;
  options: FormSelectOption[];
  placeholder?: string;
};

type FormSelectSingleProps = FormSelectBase & {
  multiple?: false;
  value: string;
  onChange: (value: string) => void;
};

type FormSelectMultipleProps = FormSelectBase & {
  multiple: true;
  value: string[];
  onChange: (value: string[]) => void;
};

type FormSelectProps = FormSelectSingleProps | FormSelectMultipleProps;

function formatMultiLabel(selected: FormSelectOption[]) {
  if (selected.length === 0) return null;
  if (selected.length === 1) return selected[0].label;
  if (selected.length === 2) return `${selected[0].label}, ${selected[1].label}`;
  return `${selected[0].label} +${selected.length - 1} more`;
}

export function FormSelect(props: FormSelectProps) {
  const {
    label,
    icon,
    options,
    placeholder = 'Select an option',
    multiple = false,
  } = props;
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const listId = useId();

  const selectedOptions = multiple
    ? options.filter((option) => (props as FormSelectMultipleProps).value.includes(option.value))
    : options.filter((option) => option.value === (props as FormSelectSingleProps).value);

  const displayValue = multiple
    ? formatMultiLabel(selectedOptions)
    : selectedOptions[0]?.label ?? null;

  useEffect(() => {
    if (!open) return;

    function handlePointerDown(event: MouseEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') setOpen(false);
    }

    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [open]);

  function toggleOption(optionValue: string) {
    if (!multiple) {
      (props as FormSelectSingleProps).onChange(optionValue);
      setOpen(false);
      return;
    }

    const current = (props as FormSelectMultipleProps).value;
    const next = current.includes(optionValue)
      ? current.filter((item) => item !== optionValue)
      : [...current, optionValue];
    (props as FormSelectMultipleProps).onChange(next);
  }

  return (
    <div className={`form-select${open ? ' is-open' : ''}${multiple ? ' is-multiple' : ''}`} ref={rootRef}>
      <span className="form-field__label">{label}</span>
      <button
        type="button"
        className="form-field__control form-select__trigger"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        onClick={() => setOpen((current) => !current)}
      >
        <span className="form-select__lead" aria-hidden>
          {icon}
        </span>
        <span className={`form-select__value${displayValue ? '' : ' is-placeholder'}`}>
          {displayValue ?? (multiple ? 'Select one or more services' : placeholder)}
        </span>
        {multiple && selectedOptions.length > 0 && (
          <span className="form-select__count">{selectedOptions.length}</span>
        )}
        <ChevronDown size={18} strokeWidth={2.2} className="form-select__chevron" aria-hidden />
      </button>

      {open && (
        <div className="form-select__dropdown">
          {multiple && (
            <p className="form-select__hint">Tap services to select multiple</p>
          )}
          <ul id={listId} className="form-select__menu" role="listbox" aria-label={label} aria-multiselectable={multiple}>
            {options.map((option) => {
              const isActive = multiple
                ? (props as FormSelectMultipleProps).value.includes(option.value)
                : option.value === (props as FormSelectSingleProps).value;
              return (
                <li key={option.value} role="presentation">
                  <button
                    type="button"
                    role="option"
                    aria-selected={isActive}
                    className={`form-select__option${isActive ? ' is-active' : ''}`}
                    onClick={() => toggleOption(option.value)}
                  >
                    {multiple && (
                      <span className={`form-select__check${isActive ? ' is-on' : ''}`} aria-hidden>
                        {isActive && <Check size={13} strokeWidth={2.6} />}
                      </span>
                    )}
                    <span className="form-select__option-label">{option.label}</span>
                    {!multiple && isActive && <Check size={16} strokeWidth={2.4} aria-hidden />}
                  </button>
                </li>
              );
            })}
          </ul>
          {multiple && (
            <div className="form-select__footer">
              <button type="button" className="form-select__done" onClick={() => setOpen(false)}>
                Done
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
