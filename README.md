# MMP Calculator

This calculator was created for the Maryland Mortgage Program (MMP)
as a way for identify products for borrowers.

## Page Assets

To install this code, you must have the `dist/index.css` and `dist/index.js` hosted somewhere publicly accessible.

jsDelivr is a free CDN service that can use Github repositories as the source, so we will be using this repository with these jsDelivr urls:

`https://cdn.jsdelivr.net/gh/owlwatch/mmp-calculator@1.0.0/dist/index.css`
`https://cdn.jsdelivr.net/gh/owlwatch/mmp-calculator@1.0.0/dist/index.js`

## Google Sheet

The products and county-based limits are sourced from a Google Sheet. In order to use this in with our calculator, you will need a Google Developer API key that has the Google Sheets API enabled.

In the example below, we will be using my API key and the Google Sheet that I created, which are both fine to reuse in production.

## Installation

To add this to the page, you will need to include the page assets as well as a target `div` element that has the Google Sheet parameters included as data attributes.

You should be able to copy and paste the following code into the HTML of any page to display the calculator.

```
<div
	data-component="mmp-mortgage-calculator"
	data-google-api-key="AIzaSyDu6xnGN_mGTV5idEi92pGstYH8aOgGJwc"
	data-google-sheet-id="1bR0zYtpYTWF6xLgt9ZnxBw5sXw1Z8TzjNmaFkjbbXrU"
></div>
<link href="https://cdn.jsdelivr.net/gh/owlwatch/mmp-calculator@1.0.0/dist/index.css" rel="stylesheet" type="text/css" />
<script src="https://cdn.jsdelivr.net/gh/owlwatch/mmp-calculator@1.0.0/dist/index.js"></script>
```

## Developing

To contribute to this repository, please create a fork of this repository and submit
changes as pull requests. If you want to host your own files for use, you can
create your own jsdeliver github hosted files.

In order to develop and build this project, you will need to make sure you have NPM
installed on your machine ([How to Install](https://www.npmjs.com/get-npm)). Once
that is setup, you can run the command `npm run serve` for ongoing development, or
`npm run build` to create a production bundle.

### `npm run serve`

This command will create a server that can be accessed at http://localhost:1234.
Any changes made to the source file will automatically be compiled and deployed to
this page without the need for a page refresh.

### Vue.js environment

The files are built with Vue.js. Please see [the documentation](https://vuejs.org/v2/guide/)
for more information on how to work with the "components", though it should be pretty
straightforward since the main classes are all set up.

### Building

To create a production build, you can run `npm run build`. Once that is done, I recommend
incrementing the version in the referenced README.md file as well as in the `test.html` file.
Commit the changes and then create a tag with the incremented version number.

## Monthly Payment algorithm

The current math for the monthly payment algorithm is:

```
term = 30
principal = purchasePrice - downPayment
interest = interestRate / 12
payments = term * 12

x = (1 + interest) ^ payments;
monthly = ( principal * x * interest ) / ( x - 1 )
```
