import React from 'react'

const FormInput = (props: any) => {
  const { name,
    value,
    id,
    extraFormClass,
    readOnly,
    disabled,
    label,
    type,
    required,
    extraClass,
    extraLabelClass,
    placeholder,
    aria,
    testid,
    change } = props
  return (
    <div className={"form-main form-group" + extraClass || ""}>
      <div className="label-container">
        <label htmlFor="" className={`form-label ${extraLabelClass}`}>
          {label || ""}
        </label>
        {/* {required ? <span className="form-span">Required</span> : null} */}
        {required ? <span className="text-danger">*</span> : null}
      </div>
      <input
        type={type || "text"}
        className={"form-control mt-1" + extraFormClass || "marker:"}
        id={id || "form-id-" + name}
        name={name || ""}
        value={value || ""}
        onChange={(e) => change(e)}
        placeholder={placeholder || ""}
        required={required || false}
        disabled={disabled || false}
        readOnly={readOnly || false}
        aria-label={aria || ""}
        data-testid={testid || ""}
      />
    </div>
  )
}

export default FormInput
