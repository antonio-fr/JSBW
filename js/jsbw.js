// JSBW : JavaScript Blockchain Writer
// Copyright (C) 2016  Antoine FERRON

// Write any string in the Bitcoin Blockchain using a simple web browser.

// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, version 3 of the License.
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.
// You should have received a copy of the GNU General Public License
// along with this program.  If not, see <http://www.gnu.org/licenses/>

$.support.cors = true;
function checkadr(account){
	console.log("Wait for payment");
	var payaddr = account.address.toString();
	document.getElementById("disp").innerHTML = 'Waiting for payment<br><a href="bitcoin:'+payaddr+'">'+payaddr+'</a>';
	window.scrollTo(0,document.body.scrollHeight);
	$.ajax({
		//url: "https://blockexplorer.com/api/addr/"+account.address.toString(),
		url: "https://api.blockcypher.com/v1/btc/main/addrs/"+payaddr,
		type: "GET",
		cache: false,
		dataType: "json",
		success: function (msg) {
			console.log(JSON.stringify(msg));
			//if (msg.unconfirmedTxApperances + msg.txApperances > 0 ){
			if ( msg.unconfirmed_n_tx + msg.final_n_tx > 0 ){
			console.log("payment received");
				document.getElementById("disp").innerHTML = "Some payments received, waiting for details";
				//setTimeout(GetUtxo, 60000, msg.transactions[msg.transactions.length - 1],account);
				if (msg.unconfirmed_n_tx>0)
					setTimeout(GetUtxo, 4000, msg.unconfirmed_txrefs[msg.unconfirmed_txrefs.length - 1].tx_hash,account);
				else
					setTimeout(GetUtxo, 4000, msg.txrefs[msg.txrefs.length - 1].tx_hash,account);
			}
			else
				setTimeout(checkadr, 20000, account);
		},
		error: function () {
			document.getElementById("disp").innerHTML = "Error";
		}
	});
}

function GetUtxo(txid,account){
	console.log("Getting utxo");
	$.ajax({
	//url: "https://blockexplorer.com/api/tx/"+txid,
	url: "https://api.blockcypher.com/v1/btc/main/txs/"+txid,
	type: "GET",
	cache: false,
	dataType: "json",
	success: function (msg) {
		var validaddr = false;
		//for (var outidx in msg.vout){
			//if (msg.vout[outidx].scriptPubKey.addresses[0]==account.address){
		for (var outidx in msg.outputs){
			if (msg.outputs[outidx].addresses[0] == account.address){
				console.log(JSON.stringify(msg.outputs[outidx]));
				validaddr = true;
				document.getElementById("disp").innerHTML = "Payment OK, processing tx";
				if ($('#chaddre').val().length > 0)
					var addrdest = $('#chaddre').val();
				else
					var addrdest = msg.inputs[0].addresses[0]; //msg.vin[0].addr;
				signtransaction(account, msg.outputs[outidx], txid, parseInt(outidx,10) , addrdest);
			}
		}
		if (!validaddr){
			setTimeout(checkadr, 30000, account);
		}

	},
	error: function () {
		document.getElementById("disp").innerHTML = "Error";
	}
});
}

var bitcore = require('bitcore-lib');

function createaddr(){
	var privateKey = new bitcore.PrivateKey();
	var address = privateKey.toAddress();
	var qrcode = new QRCode("qrcode", {width: 160,height: 160, correctLevel : QRCode.CorrectLevel.M});
	$('#qrcode').show();
	qrcode.makeCode("bitcoin:"+address);
	window.scrollTo(0,document.body.scrollHeight);
	console.log("Account for rcv created, address is "+address);
	setTimeout(checkadr, 250, {'privateKey':privateKey,'address':address} );
}

function signtransaction(account, utxo_input, txid, outid, destaddr){
	var utxo = {
	  "txId" : txid,
	  "outputIndex" : outid,
	  "script" : utxo_input.script, //utxo_input.scriptPubKey.hex,
	  "satoshis" : utxo_input.value
	};
	console.log("Transaction generation and signing");
	var transaction = new bitcore.Transaction()
     .from(utxo)
	 .fee(8000)
     .addData($('#textw').val().substring(0,39))
	 .change(destaddr)
     .sign(account.privateKey);
	document.getElementById("disp").innerHTML = "Transaction done";
	var pushtx = { tx: transaction.toString() };
	$.post('https://api.blockcypher.com/v1/btc/main/txs/push', JSON.stringify(pushtx))
		.done(function(srvrep){
			end(srvrep.tx.hash);
		})
		.fail(function(){ document.getElementById("disp").innerHTML = "Transaction sending failed";
						  end(""); }
		);
	end(txid);
}

function end(txid){
	if (txid.length>0){
		document.getElementById("disp").innerHTML = "Transaction Sent";
		document.getElementById("tx").innerHTML = 'Tx ID : <a href="https://www.blocktrail.com/BTC/tx/'+txid+'">'+txid+'</a>';	
	}
	var backbtn = document.createElement("BUTTON");
	var txtbut = document.createTextNode("Restart");
	backbtn.appendChild(txtbut);
	document.getElementById("tx").appendChild(backbtn);
	backbtn.setAttribute("id", "backbutton");
	window.scrollTo(0,document.body.scrollHeight);
	$('#backbutton').click( function () { window.location.href='jsbw.html'; });;
}

function GoProcess(msg)
{ 
	var addruser = $('#chaddre').val();
	try { if (addruser.length > 0)
		 bitcore.encoding.Base58Check(addruser); }
	catch(err){
		document.getElementById("disp").innerHTML = "Error in provided address";
		throw "Address verification failed";
	}
	if ( $('#textw').val().length > 0 ){
		$('#gobut').hide();
		document.getElementById("disp").innerHTML = 'Please Wait';
		setTimeout(createaddr, 250);
	}
}

$( document ).ready(function() { 
	$('#qrcode').hide();
	$('#gobut').click( function () {
		GoProcess();
	});
});