// @ts-nocheck
import React, { cloneElement, HTMLInputTypeAttribute, ReactNode } from "react";

export const InputRange = ({
  name,
  type,
  inputProps,
}: {
  name?: string;
  type: HTMLInputTypeAttribute;
  inputProps?:
    | [JSX.IntrinsicElements["input"], JSX.IntrinsicElements["input"]]
    | [JSX.IntrinsicElements["input"]];
}) => {
  return (
    <>
      <input type={type} name={`${name}[0]`} {...inputProps?.[0]} />
      <input type={type} name={`${name}[1]`} {...inputProps?.[1]} />
    </>
  );
};

export const Form = <T,>(
  props: Omit<JSX.IntrinsicElements["form"], "onSubmit"> & {
    onSubmit?: (value: T) => void;
  }
) => {
  return (
    <form
      {...props}
      onSubmit={(e) => {
        e.preventDefault();
        const target = e.target as HTMLFormElement;
        const type = target.type as HTMLInputTypeAttribute;
        const raw = Object.fromEntries(new FormData(target).entries());
        Object.entries(raw).forEach(([k, _v]) => {
          let v = _v;
          if (type === "number") {
            v = Number(_v);
          }
          const ks = k.split(".");
          let tmp = raw;
          for (let i = 0; i < ks.length; i++) {
            const key = ks[i];
            // TODO: JSONPath parser
            if (/^.+\[\d+\]$/.test(key)) {
              const [aKey, index] = key.split(/\[|\]/);
              console.log(aKey, index);

              if (i < ks.length - 1) {
                (tmp[aKey] ??= [])[index] = {};
              } else {
                (tmp[aKey] ??= [])[index] = v;
              }
              delete raw[k];
            } else {
              if (i < ks.length - 1) {
                tmp = tmp[key] = { ...tmp[key] };
                delete raw[k];
              } else {
                tmp[key] = v;
              }
            }
          }
        });
        console.log(raw);
        props.onSubmit?.(raw);
      }}
    ></form>
  );
};

export const FormItem = <T,>({
  name,
  label,
  children,
}: {
  name: keyof T;
  label?: (keyof T | (string & {})) | Exclude<ReactNode, string>;
  children: ReactNode;
}) => {
  return (
    <label>
      {label}
      {React.Children.map(children, (element) =>
        cloneElement(element, { name })
      )}
    </label>
  );
};

export const useForm = <T,>() => [Form<T>, FormItem<T>] as const;
