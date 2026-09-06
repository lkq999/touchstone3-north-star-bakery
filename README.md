# Touchstone 4 - North Star Bakery

This branch builds on the existing North Star Bakery HTML/CSS website and adds JavaScript interactivity for Sophia Learning's Introduction to Web Development Touchstone 4.

## Interactive feature
The Products page includes a favorites list. Visitors can save or remove bakery items, see the page update immediately, clear the list, and carry saved favorites into the Contact page.

## Validation
The Contact form uses JavaScript to prevent invalid submission and displays field-level feedback for name length, email format, pickup date, request type, and item-detail length.

## Browser storage
`localStorage` remembers two meaningful types of data: selected product favorites and a validated visitor name/email profile. Saved favorites persist across page loads and can be inserted into the pre-order details field; saved contact details are restored on a later visit.

## Code structure
Behavior is divided into small functions. Product information is managed in an array of product objects, while storage keys and validation messages are kept in separate objects.
