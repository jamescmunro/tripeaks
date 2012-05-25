var $field = $("#field");
var $hole = $("#hole");
var $hand = $("#hand");
var $card = $(".card");
var $score = $("#score");
var $cardsLeft = $("#cardsLeft");
var $fieldCard = $(".fieldCard");

var Field = function(deck){
	var cards = [],
		i;
	this.init = function(){
		cards = [];
		for(i = 0; i < 30; i++){
			cards.push(deck.deal());
		};
	};
	
	this.receiveCard = function(card){
		cards.push(card);
	};
	this.returnCard = function(index){
		return cards[index];
	};
	this.toHtml = function(){
		var arrayOut = [],
			i;
		for(i = 0; i < cards.length; i++){
			arrayOut.push('<div id="card-',  i + 1, '" class="card fieldCard ',cards[i].getSuit(),' ',cards[i].getNumber(),'">',cards[i].getName(),'</div>');
		}
		return arrayOut.join('');
	};
	this.removeCard = function(index){
		var card = cards[index];
		//cards.splice(index, 1);
		return card;
	};
	this.init();
};

var Hole = function(deck){
	var cards = [],
		i;
	
	this.init = function(){
		cards = [];
		for(i = 0; i < 22; i++){
			cards.push(deck.deal());
		};
	};
	this.hitHand = function(){
		return cards.pop();
	};
	this.receiveCard = function(card){
		cards.push(card);
	};
	this.giveCard = function(){
		return cards.pop();
	};
	this.checkForCards = function(){
		return cards.length;
	}
	this.toHtml = function(){
		var arrayOut = [],
			i;
		for(i = 0; i < cards.length; i++){
			arrayOut.push('<div class="card ',cards[i].getSuit(),' ',cards[i].getNumber(),'">',cards[i].getName(),'</div>');
		}
		return arrayOut.join('');
	};
	this.init();
};

var Hand = function(deck){
	var cards = [];
	
	this.receiveCard = function(card){
		cards.push(card);
	};
	this.toHtml = function(){
		var arrayOut = [],
			i,
			topCard = cards.length - 1;
		
		arrayOut.push('<div class="card handCard ',cards[topCard].getSuit(),' ',cards[topCard].getNumber(),'">',cards[topCard].getName(),'</div>');
		return arrayOut.join('');
	};
	this.getTopCard = function(){
		return cards[(cards.length - 1)];
	}
	this.getValue = function(){
		var topCard = this.getTopCard();
		return topCard.getNumber();
	}
	this.empty = function(){
		cards = [];
	}
};

var Score = function(){
	this.value = 0;
	this.incrementer = 1;
	
	this.addToScore = function(){
		var newValue = parseInt(this.value, 10) + parseInt(this.incrementer, 10);
		this.value = parseInt(newValue, 10);
		this.incrementer ++;
	};
	this.removeFromScore = function(){
		var newValue = parseInt(this.value, 10) - 3;
		this.value = parseInt(newValue, 10);
		this.incrementer = 1;
	};
	
	this.getScore = function(){
		return this.value;
	};
	
	this.setFromCookie = function(){
		var newValue = parseInt(readCookie("score"), 10);
		this.value = parseInt(newValue, 10);
	};
};

// Cookie Helper Methods
function createCookie(name,value,days) {
	if (days) {
		var date = new Date();
		date.setTime(date.getTime()+(days*24*60*60*1000));
		var expires = "; expires="+date.toGMTString();
	}
	else var expires = "";
	document.cookie = name+"="+value+expires+"; path=/";
}

function readCookie(name) {
	var nameEQ = name + "=";
	var ca = document.cookie.split(';');
	for(var i=0;i < ca.length;i++) {
		var c = ca[i];
		while (c.charAt(0)==' ') c = c.substring(1,c.length);
		if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length,c.length);
	}
	return null;
}

function eraseCookie(name) {
	createCookie(name,"",-1);
}


function init(){
	window.myDeck = new Deck();
	window.myHole = new Hole(myDeck);
	window.myHand = new Hand(myDeck);
	window.myField = new Field(myDeck);
	window.myScore = new Score();
	
	
	
	
	
	myDeck.shuffle();
	myDeck.deal();
	$field.html(myField.toHtml());
	myHand.receiveCard(myHole.hitHand());
	$hand.html(myHand.toHtml());
	$cardsLeft.html(myHole.checkForCards());
	
	if(readCookie("score") == null){
		var currentScore = myScore.getScore();
		createCookie("score", currentScore, 100);
	}
	
	$hole.on("click", function(){
		var currentScore = myScore.getScore();
		myHand.receiveCard(myHole.hitHand());
		
		$hand.html(myHand.toHtml());
		myScore.removeFromScore();
		updateUI();
		if(!!myHole.checkForCards()){
			$cardsLeft.html(myHole.checkForCards());
		} else{
			$hole.hide();
		}
		
	});
	
	$(".fieldCard").on("click", function(){
		var $clicked = $(this);
		var locked;
		var $clickedId = $clicked.attr("id");
		var clickedIndex = ($clickedId.split("-")[1]) - 1;
		var clickedValue = (myField.returnCard(clickedIndex)).getNumber();
		var handVal = myHand.getValue();
		
		var success = function(){
			var currentScore = myScore.getScore();
			myHand.receiveCard(myField.removeCard(clickedIndex));
			$clicked.removeClass("fieldCard").hide();
			$hand.html(myHand.toHtml());
			myScore.addToScore();
		}
		//Define an easy way to tell if a card is face-down, and if it is, "lock" the card
		if($clicked.hasClass("back")){
			locked = true;
		}
		
		//if the clicked card isn't locked...
		if(!locked){
			// ...and it's not an ace or a king...
			if((clickedValue != 1) && (clickedValue != 13)){
				// ...and the card's face value is 1 less or 1 greater than the hand card, remove it from
				// the field and add it to the hand.
				if((handVal === clickedValue + 1) || (handVal === clickedValue - 1)){
					success();
				}
				
			} else if(clickedValue  === 13){
				// what to do if the clicked card is a king
				var currentScore = myScore.getScore();
				
				if((handVal === 1) || (handVal === clickedValue - 1)){
					success();
				}
			} else if(clickedValue === 1){
				// what to do if the clicked card is an ace
				if((handVal === 13) || (myHand.getValue() === clickedValue + 1)){
					success();
				}
			}
		}
		updateUI();
			
	});
	
	
	
};

function updateUI(){
	var currentScore = myScore.getScore();
	var $fieldCard = $(".fieldCard");
	var $score = $("#score");
	var arrTop = [];
	var arrLeft = [];
	$score.html(currentScore);
	createCookie("score", currentScore, 100);
	
	// Let's try showng/hiding cards from here.
	$fieldCard.each(function(){
		var $thisLeft = parseInt($(this).css("left"), 10);
		var $thisTop = parseInt($(this).css("top"), 10);
		arrTop.push($thisTop);
		arrLeft.push($thisLeft);
		
	});
	console.log(arrLeft);
	console.log(arrTop);
	
	$fieldCard.each(function(index, el){
		var $thisTop = parseInt($(this).css("top"), 10);
		var $thisLeft = parseInt($(this).css("left"), 10);
		for(var i = 0; i < arrTop.length; i++){
			var $this = $(this);
			if(arrTop[i] == $thisTop + 40 && (arrLeft[i] == $thisLeft + 20 || arrLeft[i] == $thisLeft - 20)){
				
				$this.removeClass("front").addClass("back");
				break;
			} else {
				$this.removeClass("back").addClass("front");
			}
		}
		
	});
	
}

function reset(){
	var currentScore = myScore.getScore();
	$hole.off();
	$fieldCard.off();
	for(var i = 0; i < $(".fieldCard").length; i++){
		myScore.removeFromScore();
	}
	console.log(myScore.value);
	createCookie("score", myScore.value, 100);
	init();
	myScore.setFromCookie();
	updateUI();
	$hole.show();
}

(function(){
	
	var $newHand = $("#newHand");
	$newHand.on("click", function(){
		console.log("Reset");
		reset();
	});
	init();
	myScore.setFromCookie();
	updateUI();
	
}());
