import React from 'react'

const FormInput = ({
  extraClass,
  name,
  value,
  id,
  extraFormClass,
  readOnly,
  disabled,
  label,
  type,
  required,
}) => {
  return (
    <div className={"form-main form-group" + extraClass || ""}>
      <div className="label-container">
        <label htmlFor="" className="form-label">
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
        onChange={() => ""}
        required={required || false}
        disabled={disabled || false}
        readOnly={readOnly || false}
      />
    </div>
  )
}

export default FormInput
