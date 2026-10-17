import React from 'react'
import { UploadIcon } from '@radix-ui/react-icons'
import { AtlabsButton } from '../../../components/AtlabsButton'
import { cn } from '../../../lib/utils'
import { Field, PageSelect, DropZone, Chip, textInputClass } from '../../app/_shared'
import type { FieldValue, FieldValues, ToolConfig, ToolField } from './types'
import { asFile, asFiles, asString, asStringArray } from './types'

/* ------------------------------------------------------------------ */
/* Upload field body — dropzone + selected file chips                */
/* ------------------------------------------------------------------ */

const UploadField: React.FC<{
  field: Extract<ToolField, { type: 'upload' }>
  value: FieldValue
  onChange: (v: FieldValue) => void
}> = ({ field, value, onChange }) => {
  const single = asFile(value)
  const many = asFiles(value)

  if (!field.multiple && single) {
    return (
      <div className="flex items-center gap-3 rounded-control border border-gray-a6 bg-gray-1 px-3 py-2">
        <UploadIcon width={16} height={16} className="shrink-0 text-gray-10" />
        <span className="min-w-0 flex-1 truncate text-sm text-gray-12" title={single.name}>
          {single.name}
        </span>
        <span className="shrink-0 text-xs text-gray-9">
          {(single.size / 1024 / 1024).toFixed(1)} MB
        </span>
        <button
          type="button"
          aria-label={`Remove ${single.name}`}
          onClick={() => onChange(null)}
          className="shrink-0 rounded-control px-1.5 text-sm font-bold text-gray-10 transition-colors hover:bg-gray-3 hover:text-gray-12"
        >
          ×
        </button>
      </div>
    )
  }

  if (field.multiple && many.length > 0) {
    return (
      <div className="flex flex-col gap-2">
        <div className="flex flex-wrap gap-1.5">
          {many.map((f, i) => (
            <span
              key={`${f.name}-${i}`}
              className="inline-flex max-w-full items-center gap-1.5 rounded-full border border-gray-a6 bg-gray-1 px-2.5 py-1 text-xs text-gray-11"
            >
              <span className="truncate" title={f.name}>
                {f.name}
              </span>
              <button
                type="button"
                aria-label={`Remove ${f.name}`}
                onClick={() => onChange(many.filter((_, idx) => idx !== i))}
                className="font-bold text-gray-9 transition-colors hover:text-gray-12"
              >
                ×
              </button>
            </span>
          ))}
        </div>
        <DropZone
          label="Add more"
          hint="or drop another batch"
          accept={field.accept}
          multiple
          className="py-4"
          onFiles={(files) => onChange([...many, ...files])}
        />
      </div>
    )
  }

  return (
    <DropZone
      label={`Upload ${field.label.toLowerCase()}`}
      hint="Drag & drop or click to browse"
      accept={field.accept}
      multiple={field.multiple}
      onFiles={(files) => onChange(field.multiple ? files : (files[0] ?? null))}
    />
  )
}

/* ------------------------------------------------------------------ */
/* Slider — native range styled to the design system                 */
/* ------------------------------------------------------------------ */

const ToolSlider: React.FC<{
  field: Extract<ToolField, { type: 'slider' }>
  value: number
  onChange: (v: number) => void
}> = ({ field, value, onChange }) => (
  <div className="flex items-center gap-3">
    <input
      type="range"
      aria-label={field.label}
      min={field.min}
      max={field.max}
      step={field.step ?? 1}
      value={value}
      onChange={(e) => onChange(Number(e.target.value))}
      className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-gray-a6 accent-yellow-600"
    />
    <span className="w-16 shrink-0 text-right text-sm font-semibold text-gray-12">
      {value}
      {field.unit ?? ''}
    </span>
  </div>
)

/* ------------------------------------------------------------------ */
/* ToolConfigPanel                                                    */
/* ------------------------------------------------------------------ */

const ToolConfigPanel: React.FC<{
  config: ToolConfig
  values: FieldValues
  setValue: (id: string, value: FieldValue) => void
  generating: boolean
  error: string | null
  onGenerate: () => void
}> = ({ config, values, setValue, generating, error, onGenerate }) => (
  <div className="flex flex-col gap-4">
    {config.fields.map((field) => {
      const body = (() => {
        switch (field.type) {
          case 'upload':
            return (
              <UploadField
                field={field}
                value={values[field.id] ?? null}
                onChange={(v) => setValue(field.id, v)}
              />
            )
          case 'text':
            return (
              <input
                type="text"
                aria-label={field.label}
                className={textInputClass}
                placeholder={field.placeholder}
                value={asString(values[field.id])}
                onChange={(e) => setValue(field.id, e.target.value)}
              />
            )
          case 'textarea':
            return (
              <textarea
                aria-label={field.label}
                className={cn(
                  'w-full rounded-control border border-gray-a6 bg-white px-3 py-2 text-sm text-gray-12',
                  'placeholder:text-gray-9 focus:outline-none focus-visible:ring-1 focus-visible:ring-ring',
                )}
                placeholder={field.placeholder}
                rows={field.rows ?? 5}
                value={asString(values[field.id])}
                onChange={(e) => setValue(field.id, e.target.value)}
              />
            )
          case 'select':
            return (
              <PageSelect
                ariaLabel={field.label}
                value={asString(values[field.id])}
                onValueChange={(v) => setValue(field.id, v)}
                options={field.options}
                placeholder={field.placeholder ?? 'Select…'}
              />
            )
          case 'chips': {
            const selected = asStringArray(values[field.id])
            return (
              <div className="flex flex-wrap gap-1.5">
                {field.options.map((opt) => (
                  <Chip
                    key={opt}
                    label={opt}
                    selected={selected.includes(opt)}
                    onClick={() => {
                      if (field.multi) {
                        setValue(
                          field.id,
                          selected.includes(opt)
                            ? selected.filter((s) => s !== opt)
                            : [...selected, opt],
                        )
                      } else {
                        setValue(field.id, selected.includes(opt) ? [] : [opt])
                      }
                    }}
                  />
                ))}
              </div>
            )
          }
          case 'slider':
            return (
              <ToolSlider
                field={field}
                value={typeof values[field.id] === 'number' ? (values[field.id] as number) : field.min}
                onChange={(v) => setValue(field.id, v)}
              />
            )
          case 'custom':
            return field.render({
              value: values[field.id] ?? null,
              setValue: (v) => setValue(field.id, v),
              values,
            })
          default:
            return null
        }
      })()

      return (
        <Field key={field.id} label={field.label} hint={field.hint}>
          {body}
        </Field>
      )
    })}

    {error ? (
      <p className="rounded-control border border-red-200 bg-red-50 px-3 py-2 text-xs font-medium text-red-700">
        {error}
      </p>
    ) : null}

    <AtlabsButton
      variant="primary"
      size="lg"
      className="w-full"
      disabled={generating}
      onClick={onGenerate}
    >
      {generating ? 'Generating…' : (config.generateLabel ?? 'Generate')}
    </AtlabsButton>
  </div>
)

export default ToolConfigPanel
