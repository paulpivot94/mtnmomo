class MoMoPayment {

    constructor(phone, classementfinal) {
    	var classObj = this; // store scope for event listeners
    	this._chars = 'AaBbCcDdEeFfGgHhIiJjKkLlMmNnOoPpQqRrSsTtUuVvWwXxYyZz1234567890';
    	this.PRIX_VOTE = "100";
    	this.randomId = new Date().getTime();
    	// this._random = Random();
    	this.INIT_PAY_URL = "https://sandbox.momodeveloper.mtn.com/v1_0/apiuser"; // ok
    	this.SUBSCRIPTION_KEY_USER = "66ca3391fde24b25b9d21b91b58d7b30"; //""; // OK
    	this.SUBSCRIPTION_KEY_TRANS = "836f1e757b264aa3835e05dd322363bc"; //alain => df4cf9202e6f4e3697aa0c60d19f4233 //OK
    	this.UNIQUE_REF = classObj.create_UUID();
    	this.USER_CREATED = false;
    	this.APP_KEY = "";
    	
    	this.phoneNumber = phone;
    	this.vote = classementfinal;
    	this.payResponse = {};
    	this.payStatusResp = {};
    	this.token = "";
    	this.REFERENCE = "";
    	var ref = "";
    
    
    
    	this.body = {"providerCallbackHost": "string"};
    	this.header = {'X-Reference-Id': classObj.UNIQUE_REF, 'Content-Type': 'application/json', 'Ocp-Apim-Subscription-Key': classObj.SUBSCRIPTION_KEY_USER };
    
    
    	this.counter = 0;
    	this.timeout;
    	this.timer_on = 0;
    	// insertVote();
    
    	classObj.createUser();
    	// classObj.getToken(classObj.phoneNumber);
    
    	console.log('Class attr val: ' + this.phoneNumber);
    
    	newVote.NumeroSMS = classObj.phoneNumber;
    	newVote.ContenuSMS = classObj.vote;
    }
    
    
    create_UUID(){
    	var dt = new Date().getTime();
    	var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    		var r = (dt + Math.random()*16)%16 | 0;
    		dt = Math.floor(dt/16);
    		return (c=='x' ? r :(r&0x3|0x8)).toString(16);
    	});
    	return uuid;
    }
    
    
    
    /**
     * Function de creation de l'utilisateur
     * STEP 1: User Provisioning 
     */
    createUser() {
    	var that = this;
    
    	$.ajax({
    		url: this.INIT_PAY_URL,
    		beforeSend: function(xhrObj){
    			// Request headers
    			xhrObj.setRequestHeader("X-Reference-Id", this.UNIQUE_REF);
    			xhrObj.setRequestHeader("Content-Type","application/json");
    			xhrObj.setRequestHeader("Ocp-Apim-Subscription-Key", this.SUBSCRIPTION_KEY_USER);
    		},
    		type: "POST",
    		// Request body
    		data: "",
    	})
    	.done(function(data) {
    		alert("User successfully created " + JSON.stringify(data));
    		/** Appeler la fonction de creation de l'Api Key get token*/
    		this.USER_CREATED = true;
    		that.getApiKey();
    	})
    	.fail(function(error) {
    		alert("ERREUR D'INNITIALISATION");
    	});
    }
    
    
    /**
     * Function de creation de l'Api Key
     * STEP 2: Create Api Key
     */
    
    getApiKey() {
    	var that = this;
    	var token = "";
    
    
    	$.ajax({
    		url: "https://sandbox.momodeveloper.mtn.com/v1_0/apiuser/" + this.UNIQUE_REF + "/apikey",
    		beforeSend: function(xhrObj){
    			// Request headers
    			xhrObj.setRequestHeader("Ocp-Apim-Subscription-Key",this.SUBSCRIPTION_KEY_USER);
    		},
    		type: "POST",
    		// Request body
    		data: "",
    	})
    	.done(function(data) {
    		alert("Api Key successfully created " + JSON.stringify(data));
    		this.APP_KEY = data.apikey;
    	})
    	.fail(function() {
    		alert("error ApiKey");
    	});
    }
    
    
    
    getToken() {
    	
    	$.ajax({
    		url: "https://sandbox.momodeveloper.mtn.com/collection/token/",
    		beforeSend: function(xhrObj){
    			// Request headers
    			xhrObj.setRequestHeader("Authorization","Basic " + btoa(this.UNIQUE_REF + ":" + this.APP_KEY));
    			xhrObj.setRequestHeader("Ocp-Apim-Subscription-Key",this.SUBSCRIPTION_KEY_TRANS);
    		},
    		type: "POST",
    		// Request body
    		data: "",
    	})
    	.done(function(data) {
    		alert("Access token was successfully generated " + JSON.stringify(data.access_token));
    		this.token = data.access_token;
    	})
    	.fail(function() {
    		alert("error Creation token");
    	});
    }
    
    
    
    requestPayment() {
    
    	$.ajax({
    		url: "https://sandbox.momodeveloper.mtn.com/collection/v1_0/requesttopay",
    		beforeSend: function(xhrObj){
    			// Request headers
    			xhrObj.setRequestHeader("Authorization","Bearer " + this.token);
    			// xhrObj.setRequestHeader("X-Callback-Url","");
    			xhrObj.setRequestHeader("X-Reference-Id", this.UNIQUE_REF);
    			xhrObj.setRequestHeader("X-Target-Environment","sandbox");
    			xhrObj.setRequestHeader("Content-Type","application/json");
    			xhrObj.setRequestHeader("Ocp-Apim-Subscription-Key", this.SUBSCRIPTION_KEY_TRANS);
    		},
    		type: "POST",
    		// Request body
    		data: JSON.stringify({
    			"amount": this.PRIX_VOTE,
    			"currency": "EUR",
    			"externalId": this.randomId,
    			"payer": {
    				"partyIdType": "MSISDN",
    				"partyId": "237" + this.phoneNumber,
    			},
    			"payerMessage": "Merci de nous faire confiance revenez pour les resultats",
    			"payeeNote": "Frais de vote"
    		}),
    	})
    	.done(function(data) {
    		alert("Payment accepted successfully 202" + JSON.stringify(data));
    		// this.ref = response.reference;
    	})
    	.fail(function() {
    		alert("error payment");
    	});
    
    }
    
    
    getPayStatus(reference, token) {
    
    	var that = this;
    	console.log("contenu de la trasaction: ref => " + token + ", object =>", this.payResponse);
    	// return;
    
    	var settingsStatus = {
    		"url": "https://demo.campay.net/api/transaction/" + reference + "/",
    		"method": "GET",
    		"timeout": 0,
    		"headers": {
    			"Authorization": "Token " + token,
    			"Content-Type": "application/json"
    		},
    	};
    
    	$.ajax(settingsStatus).done(function(response) {
    
    		this.payStatusResp = response;
    
    		if (response.status == 'PENDING') {
    			console.log(response.status);
    			that.getPayStatus(reference, token);
    			// setTimeout(getPayStatus, 6000, [reference, token]);
    		}
    
    		if (response != {}) {
    
    			if (response.status == 'SUCCESSFUL') {
    				// this.stopCount();
    				this.payStatusResp = response;
    				payStatus = response;
    				// update the status of payment into database correspond to the returned reference
    				// getVoteData(data),
    
    				$('.load').html('Checkout<i class="fa fa-long-arrow-right ml-1"></i>');
    				$('#payModal').modal('hide');
    				// alert('GOOD YOUR PAYMENT HAS BEEN APPROVED');
    
    				// Get.to(() => Success()),
    				// setTimeout(function() {
    				//     window.location.href = base_url + "?page=Success";
    				// }, 2000);
    				// Insert vote into database here for one time insertion
    				insertVote();
    
    			}
    
    			if (response.status == 'FAILED') {
    				// update the status of payment into database correspond to the returned reference
    				$('.load').html('Checkout<i class="fa fa-long-arrow-right ml-1"></i>');
    				alert('YOUR PAYMENT HAS NOT BEEN APPROVED');
    				$('#payModal').modal('hide');
    			}
    		}
    
    		// return response;
    	})
    
    	.fail(function(error) {
    		// this.stopCount();
    		alert("La requête s'est terminée en échec. Infos : " + JSON.stringify(error));
    	});
    
    }


}

