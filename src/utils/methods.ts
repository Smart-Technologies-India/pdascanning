import { value } from "valibot";

const errorToString = (e: unknown): string => {
  let err: string = "";
  if (typeof e === "string") {
    err = e.toUpperCase();
  } else if (e instanceof Error) {
    err = e.message;
  }
  return err;
};

export { errorToString };

const isContainSpace = (value: string): boolean => {
  return !value.includes(" ");
};

export { isContainSpace };

const capitalcase = (value: string): string => {
  const words = value.split(" ");

  const capitalWords = words.map((str) => {
    return str.charAt(0).toUpperCase() + str.slice(1);
  });

  return capitalWords.join(" ");
};

export { capitalcase };

const onlyNumbersRegex = /^[0-9]*$/;

/**
 * Handles the change event for a number input field in a React component.
 * If the input value does not match the regex pattern for numbers, it clears the input field.
 * @param {React.ChangeEvent<HTMLInputElement>} event - The change event object
 * @returns None
 */
const handleNumberChange = (event: React.ChangeEvent<HTMLInputElement>) => {
  const { value } = event.target;
  if (!onlyNumbersRegex.test(value)) {
    event.target.value = event.target.value.slice(0, -1);
  }
};

export { handleNumberChange };

const onlyDecimalRegex = /^[0-9.]*$/;

/**
 * Handles the change event for an input element to allow only decimal values.
 * @param {React.ChangeEvent<HTMLInputElement>} event - The change event object.
 * @returns None
 */
const handleDecimalChange = (event: React.ChangeEvent<HTMLInputElement>) => {
  const { value } = event.target;
  if (!onlyDecimalRegex.test(value)) {
    event.target.value = event.target.value.slice(0, -1);
  }
};

export { handleDecimalChange };

/**
 * Truncates a given text to a specified length and appends "..." if the text exceeds the length.
 * @param {string} text - The text to truncate.
 * @param {number} long - The maximum length of the truncated text.
 * @returns The truncated text with "..." appended if it exceeds the specified length.
 */
const longtext = (text: string, long: number): string => {
  if (text.length <= long) {
    return text;
  } else {
    return text.substring(0, long) + " ...";
  }
};
export { longtext };
