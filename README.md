  JSBW
===========

JSBW is a web app that writes any string in the Bitcoin Blockchain using a simple web browser.


## Get JSBW

You can download a zip package in release section, with all third-party library included :

https://github.com/antonio-fr/JSBW/releases


From git source, you need the following javascript library:
* bitcore-lib
* jquery
* qrcode


## Using JSBW

Load in a web browser, from local files or a web server jsbw.html file. 

Enter text, an optional change address where to send the money back. Click on Go to proceed. Pay some bitcoin (>16000 satoshis) to the provided address, the app will automatically send the money back to you. Either to your address used for payment or to the change option address.

JSBW performs the following task

* Check change address (if provided)
* Create a new Bitcoin account, dedicated for the task
* Generate QR code
* Wait for the payment
* Get UTXO once the payment is detected
* Generate and sign a transaction embedding the chosen string in a OP_RETURN output


## Cost of writing

The transaction made by JSBW that embed the OP_RETURN has been set up with a 8000s fee. In this transaction, a second output is set to send the fund back to your address. The total price of writing in the Blockchain is the sum of the fee when you pay to the app (to QRCode) and the fee of the second transaction made by JSBW (8ks). To date, this is between 12 and 18ks, so approximately 0.06$.


## Security consideration

The private key stays in the web browser. Generating and signing the transaction are done in browser. The app communicates with blockcypher API in order to watch for payment and get the unspend output of your payment.

Don't transfer too much amount to the app address. The security is well enough for a minute long holding small amount, nothing more. Also this software might have youth bugs that can block transactions.


## ToDo

* Use multiple OP_RETURN to write longer strings
* Adjust Fees, needed in case of multiple OP_RETURN
* Improve UI for less austere


License :
----------

JSBW : JavaScript Blockchain Writer 
Copyright (C) 2016  Antoine FERRON

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, version 3 of the License.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program.  If not, see <http://www.gnu.org/licenses/>.
