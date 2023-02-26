// @ts-nocheck
import React, { cloneElement, HTMLInputTypeAttribute, ReactNode } from "react";
import set from "lodash/set";

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
        const cooked: T = {};
        Object.entries(raw).forEach(([k, _v]) => {
          let v = _v;
          if (type === "number") {
            v = Number(_v);
          }
          set(cooked, k, v);
        });
        console.log(raw, cooked);
        props.onSubmit?.(cooked);
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
