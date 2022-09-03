import { sendBadRequest } from './handler-error';
import { ObjectId } from 'mongodb';
import { AddedProductToCart } from '../class/added-product.class';

const SPEC_SYMBOLS = [
  '!',
  '$',
  '&',
  '*',
  '-',
  '=',
  '^',
  '`',
  '|',
  '~',
  '#',
  '%',
  "'",
  '+',
  '/',
  '?',
  '_',
  '{',
  '}',
];

export function checkId(id: string): void {
  if (!ObjectId.isValid(id)) sendBadRequest('Id is invalid (not ObjectId)');
}

export function validateEmail(email: string): void {
  const validate = (email: string) => {
    if (email == null || email.length < 5) return false;

    const indexAt = email.lastIndexOf('@');
    if (indexAt < 1) return false;

    const untilEt = email.substring(0, indexAt);
    if (untilEt[0] === `"` && untilEt[0] !== `"`) return false;

    const postEt = email.substring(indexAt + 1);
    const domain = postEt.split('.');
    if (domain.length != 2 && !domain[1]) return false;

    const joinDomain = domain.join('');
    for (let i = 0; i < SPEC_SYMBOLS.length; i++)
      if (joinDomain.includes(SPEC_SYMBOLS[i])) return false;

    return true;
  };
  if (!validate(email)) sendBadRequest('Email is not valid');
}

export function validatePassword(password: string): void {
  if (password == null || password.length < 8 || password.length > 32)
    sendBadRequest(
      'Password is too short or too long, number of characters must be between 8 and 32',
    );
  if (RegExp('.*\\s.*').test(password))
    sendBadRequest('Password must not contain spaces');

  if (RegExp('.*(.)\\1{3}.*').test(password))
    sendBadRequest(
      'Password must not contain four identical characters in a row',
    );
}

export function validatePhone(phone: string): void {
  if (!phone || phone.length < 6) sendBadRequest('Phone is invalid');
}

/**custom validation because the validation class doesn't want to work =)*/
export function validateArrAddedProductToCart(arr: AddedProductToCart[]): void {
  arr.forEach((value) => {
    if (
      value.product &&
      value.requiredQuantity &&
      typeof value.product === 'string' &&
      Number.isInteger(value.requiredQuantity) &&
      value.requiredQuantity > 0
    )
      checkId(value.product);
    else sendBadRequest("cartOrder isn't correct");
  });
}
