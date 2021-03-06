/** Our Tripeaks game.
 * @namespace 
 */
var Tripeaks = {
		/** An object containing default game properties. */
		defaults: (function () {
			var cardWidth = 100,
				publicObject = {
					/** The number of peaks. Tri means 3. */
					peaks: 3,
					cardWidth: cardWidth,
					cardHeight: 144,
					topOffset: 75,
					leftOffset: cardWidth / 2
				};
			return publicObject;
		}()),
		/** The remainder of the deck not face-up. */
		hole:null,
		/** The face-up pile from the hole. */
		hand:null,
		/** The playing field. */
		field:null,
		/** The deck of cards to use. */
		deck: null,
		/** So the player feels like they accomplished something. */
		score: null
	},
	/** 
	 * Cookie helper functions
	 * @namespace
	 */
	Cookie = {
		/**
		 * Sets a cookie.
		 * @param name {string} the name of the cookie you want to create
		 * @param value {number} the value of the score you want to set
		 * @param days {number} the number of days to store the cookie
		 */
		create: function (name, value, days) {
			var expires,
				date = new Date();
			if (days) {
				date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
				expires = "; expires=" + date.toGMTString();
			} else {
				expires = "";
			}
			document.cookie = name + "=" + value + expires + "; path=/";
		},
		/**
		 * Gets a cookie.
		 * @param name {string} the name of the cookie you want to read
		 * @return {null}
		 */
		read: function (name) {
			var i,
				c,
				nameEQ = name + "=",
				ca = document.cookie.split(';');
			for (i = 0; i < ca.length; i++) {
				c = ca[i];
				while (c.charAt(0) === ' ') {
					c = c.substring(1, c.length);
				}
				if (c.indexOf(nameEQ) === 0) {
					return c.substring(nameEQ.length, c.length);
				}
			}
			return null;
		}
	},
    Local = {
        create: function(name, value){
            window.localStorage.setItem(name, value);
        },
        
        read: function(name){
            return window.localStorage.getItem(name);
        }
        
    },
    Prefs = {
        setTheme: function(stylename){
            Local.create("theme", stylename);
            $('<link />').attr({
                'id': 'switcher',
                'rel': 'stylesheet',
                'href': 'themes/' + stylename + '/' + stylename + '.css',
                'type': 'text/css'
            }).appendTo($('head'));
        }
    },
	/**
	 * Represents an individual playing card.
	 * @class 
	 * @parameter suit {Number} The number associated with the suit (1 is Hearts, 2 is Clubs, 3 is Spades, 4 is Diamonds)
	 * @parameter number {Number} The number of the card ex A is 1 K is 13
	 */
	Card = function (suit, number) {
		/** @return {Number} The number of the card in the deck. (1-52) */
		this.getNumber = function () {
			return number;
		};
		/** @return {String} The name of the suit. "Hearts","Clubs","Spades", or "Diamonds." */
		this.getSuit = function () {
			var suitName = '';
			switch (suit) {
			case 1:
				suitName = "Hearts";
				break;
			case 2:
				suitName = "Clubs";
				break;
			case 3:
				suitName = "Spades";
				break;
			case 4:
				suitName = "Diamonds";
				break;
			}
			return suitName;
		};
		/** @return {String} The HTML-encoded symbol of the suit. */
		this.getSymbol = function () {
			var suitName = '';
			switch (suit) {
			case 1:
				suitName = "&hearts;";
				break;
			case 2:
				suitName = "&clubs;";
				break;
			case 3:
				suitName = "&spades;";
				break;
			case 4:
				suitName = "&diams;";
				break;
			}
			return suitName;
		};
		/** @return {Number} The value of the card for scoring. */
		this.getValue = function () {
			var value = number;
			if (number >= 10) {
				value = 10;
			}
			if (number === 1) {
				value = 11;
			}
			return value;
		};
		/** @return {String} The name of the card. "Ace" */
		this.getName = function () {
			var cardName = '';
			switch (number) {
			case 1:
				cardName = "A";
				break;
			case 13:
				cardName = "K";
				break;
			case 12:
				cardName = "Q";
				break;
			case 11:
				cardName = "J";
				break;
			default:
				cardName = number;
				break;
			}
			return cardName;
		};
		/** @return {String} The full name of the card. "Ace of Spades" */
		this.getFullName = function () {
			return this.getName() + this.getSymbol();
		};
		/**
		 * This function sets the background-positions for the cards in the field.
		 * Created because background-position-x is not supported in firefox.
		 * @return {string} the background position css rule value ex: -155px -400px
		 */
		this.getBackgroundPosition = function () {
			var bgp,
				posX = 0,
				posY = 0,
				borderWidth = 1;
			switch (this.getSuit()) {
			case "Clubs":
				// Nothing to do here.
				break;
			case "Diamonds":
				posX = Tripeaks.defaults.cardWidth;
				break;
			case "Hearts":
				posX = Tripeaks.defaults.cardWidth * 2;
				break;
			case "Spades":
				posX = Tripeaks.defaults.cardWidth * 3;
				break;
			}
			switch (this.getName()) {
			case 2:
				// Nothing to do here.
				break;
			case 3:
				posY = Tripeaks.defaults.cardHeight;
				break;
			case 4:
				posY = Tripeaks.defaults.cardHeight * 2;
				break;
			case 5:
				posY = Tripeaks.defaults.cardHeight * 3;
				break;
			case 6:
				posY = Tripeaks.defaults.cardHeight * 4;
				break;
			case 7:
				posY = Tripeaks.defaults.cardHeight * 5;
				break;
			case 8:
				posY = Tripeaks.defaults.cardHeight * 6;
				break;
			case 9:
				posY = Tripeaks.defaults.cardHeight * 7;
				break;
			case 10:
				posY = Tripeaks.defaults.cardHeight * 8;
				break;
			case "J":
				posY = Tripeaks.defaults.cardHeight * 9;
				break;
			case "Q":
				posY = Tripeaks.defaults.cardHeight * 10;
				break;
			case "K":
				posY = Tripeaks.defaults.cardHeight * 11;
				break;
			case "A":
				posY = Tripeaks.defaults.cardHeight * 12;
				break;
			}
			posX += borderWidth;
			posY += borderWidth;
			bgp = "-" + posX + "px -" + posY + "px";
			return bgp;
		};
	},
	/**
	 * A set of 52 cards.
	 * @class
	 */
	Deck = function () {
		/* Creates a new set of cards. */
		var cards = [],
			newCards = function () {
				var i,
					suit,
					number;
				for (i = 0; i < 52; i++) {
					suit = i % 4 + 1;
					number = i % 13 + 1;
					cards.push(new Card(suit, number));
				}
			};
		/* Actually create those new cards. */
		newCards();
		/**
		 * Shuffles the cards. Modifies the private instance of the cards array.
		 * @return {Deck} For chainability we return 'this'
		 */
		this.shuffle = function () {
			for (var j, x, i = cards.length; i; j = parseInt(Math.random() * i, 10), x = cards[--i], cards[i] = cards[j], cards[j] = x) {
				// Crazy shuffle routine.
			}
			return this;
		};
		/** @return {Array<Card>} An array of cards representing the Deck. */
		this.getCards = function () {
			return cards;
		};
		/** @return {Card} Deals the top card off the deck. Removes it from the Deck. */
		this.deal = function (hole) {
			var i;
			this.shuffle();
			if (!cards.length) {
				newCards();
				this.shuffle();
			}
			for (i = 0; i < 31; i++) {
				return this.hit();
			}
			for (i = 0; i < this.cards.length; i++) {
				hole.receiveCard(this.hit());
			}
		};
		/* @return {Card} Pops the top card off the deck. */
		this.hit = function () {
			return cards.pop();
		};
	},
	/**
	 * Field is the peaks themselves. This does not include the hole or hand.
	 * 
	 * @class
	 * @param deck {Deck} The deck you want to deal from.
	 */
	Field = function (deck) {
		var cards = [],
			i,
			peaksLeft = Tripeaks.defaults.peaks;
		this.cardCount = 30;
		/* Create the field, populate the cards array. */
		for (i = 0; i < this.cardCount; i++) {
			cards.push(deck.deal());
		}
		/**
		 * accepts a card and adds it to the cards array
		 * @param card {Card} the card being received by the field 
		 */
		this.receiveCard = function (card) {
			cards.push(card);
		};
		/**
		 * Returns a single card object in the array
		 * @param index {Number} the index of the card in the cards array.
		 * @return {Card} The card at the specified index in the field.
		 */
		this.getCard = function (index) {
			return cards[index];
		};
		/**
		 * Creates a div for each card in the cards array.
		 * @return {String} The HTML representation of the field.
		 */
		this.toHtml = function () {
			var arrayOut = [],
				i,
				peak;
			for (i = 0; i < cards.length; i++) {
				peak = "";
				if (i < Tripeaks.defaults.peaks) {
					peak = " peak";
				}
				arrayOut.push('<div id="card-', i + 1, '" class="card fieldCard' + peak + '" data-card="', cards[i].getSuit().toLowerCase(), '_', String(cards[i].getName()).toLowerCase(), '" style="background-position:', cards[i].getBackgroundPosition() ,';" />');
			}
			return arrayOut.join('');
		};
		/*
		 * Returns a jQuery selection of each individual field card.
		 * @return {jQuery} Selection of all field cards.
		 */
		this.getHtmlElements = function () {
			var arrayOut = [],
				i;
			for (i = 0; i < cards.length; i++) {
				arrayOut.push('#card-' + (i + 1));
			}
			return $(arrayOut.join());
		};
		/**
		 * Removes a single card from the cards array
		 * @param index {number} the index of the card in the cards array that you want to remove
		 * @return {Card} The card to be removed.
		 */
		this.removeCard = function (index) {
			var card = cards[index];
			return card;
		};
		/**
		 * Get the number of peaks remaining.
		 * @return {Number} the number of peaks left on the field.
		 */
		this.getNumPeaks = function () {
			return peaksLeft;
		};
		/**
		 * Subtracts one from the number of peaks on the field.
		 * @void
		 */
		this.removePeak = function () {
			peaksLeft--;
		};
		/** References the DOM element used to display the field. */
		this.$element = $('#field');
		/** Updates the DOM element associated with this object. */
		this.updateDOM = function () {
			this.$element.html(this.toHtml());
			return this;
		};
	},
	/**
	 * Hole is the remainder of the deck after field is laid out.
	 * @class
	 * @param deck {Deck} The deck to deal from.
	 * @todo ensure that the deck is the same as the field's deck to make sure we aren't dealing from separate piles.
	 */
	Hole = function (deck) {
		var cards = [],
			i;
		for (i = 0; i < 22; i++) {
			cards.push(deck.deal());
		}
		/**
		 * Pops the top card off of the stack
		 * @return {Card} The next card in the deck
		 */
		this.hitHand = function () {
			return cards.pop();
		};
		/**
		 * Puts a new card object into the cards array
		 * @param card {Card} The card you want to push to the hole
		 * @void
		 */
		this.receiveCard = function (card) {
			cards.push(card);
		};
		/** @return {number} The total number of card objects in the cards array */
		this.checkForCards = function () {
			return cards.length;
		};
		/** References the DOM element used to display the hole. */
		this.$element = $("#hole");
		/** Updates the DOM element associated with this object. */
		this.updateDOM = function () {
			var $cardsLeft = $("#cardsLeft");
			$cardsLeft.html(this.checkForCards());
			if (!this.checkForCards()) {
				this.$element.hide();
			}
		};
	},
	/**
	 * Hand is the face-up cards you play on the Field from.
	 * @class
	 * @param deck {Deck} The deck to deal from.
	 */
	Hand = function () {
		var cards = [];
		/**
		 * Receive a card into this hand.
		 * @param card {Card} the card that is being received
		 * @return {Hand} For chainability we return 'this'
		 */
		this.receiveCard = function (card) {
			cards.push(card);
			return this;
		};
		/**
		 * HTML output
		 * @return {String} The HTML representation of the hand.
		 */
		this.toHtml = function () {
			var arrayOut = [],
				topCard = cards.length - 1,
				cardSuit = cards[topCard].getSuit(),
				cardName = cards[topCard].getName();
			arrayOut.push('<div class="card front handCard" data-card="', cardSuit.toLowerCase(), '_', String(cardName).toLowerCase(), '" style="background-position:', cards[topCard].getBackgroundPosition(), ';" />');
			return arrayOut.join('');
		};
		/**
		 * The top card is the only interactive hand card.
		 * @return {Card} The top card on the pile
		 */
		this.getTopCard = function () {
			return cards[(cards.length - 1)];
		};
		/**
		 * Gets the number of the top card.
		 * @return {String} String representation of the card number
		 */
		this.getValue = function () {
			return this.getTopCard().getNumber();
		};
		/**
		 * References the DOM element used to display the hand.
		 */
		this.$element = $('#hand');
		/** Updates the DOM element associated with this object. 
         * @void
         */
		this.updateDOM = function () {
			this.$element.html(this.toHtml());
			return this;
		};
	},
	/**
	 * Score is the player's... score.
	 * @class
	 */
	Score = function () {
		var //value = (window.Cookie && window.Cookie.read("score") !== 'NaN') ? parseInt(window.Cookie.read("score"), 10) : 100,
            value = (Local.read("score")) ? parseInt(Local.read("score"), 10) : 100,
			incrementer = 1,
			currentRun = 0,
			bestRun = 0,
            allTimeBestRun = (Local.read("allTimeBestRun")) ? parseInt(Local.read("allTimeBestRun"), 10) : 0;

		/** @return {number} The best run of the hand */
		this.getBestRun = function () {
			return bestRun;
		};
		/** @return {number} The best run so far */
		this.setBestRun = function () {
			if (currentRun > bestRun) {
				bestRun = currentRun;
			}
			return bestRun;
		};
        /** @return {number} The best run to date */
        this.getAllTimeBestRun = function () {
            return allTimeBestRun;
        };
        /** @return {number} the best run to date */
        this.setAllTimeBestRun = function () {
            if(currentRun > parseInt(allTimeBestRun, 10)) {
                allTimeBestRun = currentRun;
                Local.create("allTimeBestRun", allTimeBestRun);
            }
            return allTimeBestRun;
        };
		/**
		 * Adds the appropriate amount to your score. Fires when a card in the field is clicked on and causes score to go up
		 * @parameter isPeak {Boolean} Whether the card clicked was a peak or not.
		 * @void
		 */
		this.addToScore = function (isPeak) {
			var numPeaks;
			if (isPeak === false) {
				value += incrementer;
				currentRun += incrementer;
			} else {
				numPeaks = Tripeaks.field.getNumPeaks();
				switch (numPeaks) {
				case 3:
				case 2:
					value += 15;
					currentRun += 15;
					break;
				case 1:
					value += 30;
					currentRun += (incrementer + 30);
					break;
				}
				Tripeaks.field.removePeak();
			}
			incrementer++;
		};
		/**
		 * Remove points from the score and reset the score incrementer
		 * @void
		 */
		this.removeFromScore = function () {
			value -= 5;
			currentRun = 0;
			incrementer = 1;
		};
		/** @return {number} The score */
		this.getScore = function () {
			return value;
		};
		/** @return {number} the amount of points in the current run */
		this.getCurrentRun = function () {
			return currentRun;
		};
		/** References the DOM element used to display the score. */
		this.$element = $("#score");
		/**
		 * Saves the score to a cookie.
		 * @return {Score} 'this' For chainability
		 */
		this.save = function () {
			Cookie.create("score", value, 100);
            Local.create("score", value);
			return this;
		};
		/**
		 * Updates the DOM element for the score.
		 * @return {Score} 'this' For chainability
		 */
		this.updateDOM = function (){
			this.$element.text(value);
			return this;
		};
	};
/**
 * Shows the stat updates, updates the score cookie and toggles card visibility.
 * @void
 */
Tripeaks.updateUI = function () {
	var arrTop = [],
		arrLeft = [];
	this.score.updateDOM().save();
	$("#currentRun").text(this.score.getCurrentRun());
	$("#bestRun").text(this.score.setBestRun());
    $("#allTimeBestRun").text(this.score.setAllTimeBestRun());
	// Two .each loops on the same collection of nodes seems strange,
	// but we need to create the entire array before we start checking
	// the cards against it. This is a good case for having a small db.
	this.field.getHtmlElements().each(function () {
		var offset = $(this).offset();
		arrTop.push(offset.top);
		arrLeft.push(offset.left);
	}).each(function (index, el) {
		var $this = $(this),
			offset = $this.offset(),
			i;
		for (i = 0; i < arrTop.length; i++) {
			if (arrTop[i] === offset.top + Tripeaks.defaults.topOffset && (arrLeft[i] === offset.left + Tripeaks.defaults.leftOffset || arrLeft[i] === offset.left - Tripeaks.defaults.leftOffset)) {
				$this.removeClass("front").addClass("back");
				break;
			} else {
				$this.removeClass("back").addClass("front");
			}
		}
	});
	// This displays the cards left count.
    Tripeaks.hole.updateDOM();
};
/**
 * Initializes the game
 * @void
 */
Tripeaks.init = function () {
	var rowLimit = this.defaults.peaks,
		gapWidth = this.defaults.peaks * this.defaults.cardWidth,
		nextIndex = rowLimit,
		startingOffset = this.defaults.peaks * this.defaults.leftOffset,
		// positioning the first card
		topPos = 0,
		leftPos = startingOffset,
		// used as a row counter and as a way to determine the clustering of cards.
		grouping = 1,
		// an incrementer that lets us know where we are in the grouping.
		groupCount,
		// an incrementer for each card in the field.
		cardCount,
		// we skip calculating the first element in a row. That is done when the row is reset.
		newRow = true,
		// this is the one and only finish animation function.
		finishAnimation = function(){
			/* Only run when the last card is dealt */
			if($(this).attr("id") === "card-" + Tripeaks.field.cardCount){
				Tripeaks.updateUI();
				Tripeaks.hand.updateDOM();
			}
		};
	this.deck = new Deck();
	this.score = new Score();
	this.hole = new Hole(this.deck);
	this.hand = new Hand();
	this.field = new Field(this.deck);
    // Set the theme
    Prefs.setTheme(Local.read("theme"));
	// Shuffle 'em and deal 'em
	this.deck.shuffle().shuffle().deal();
	// Hand gets one from the hole
	this.hand.receiveCard(this.hole.hitHand());
	/* Animate the field cards from the Hole. */
	this.hole.updateDOM();
	this.field.updateDOM();
	for (cardCount = 1; cardCount <= this.field.cardCount; cardCount++) {
		// The new row's first card is good to go
		if (!newRow) {
			// This happens regardless.
			leftPos += this.defaults.cardWidth;
			if (groupCount === grouping) {
				// Add gap and reset group counter.
				leftPos += gapWidth;
				groupCount = 1;
			} else {
				// Increment the group counter.
				groupCount++;
			}
		} else {
			// start the grouping/gap calculations on the remaining cards in this row
			newRow = false;
			groupCount = 1;
		}
        // Animate the card using jQuery
		$("#card-" + cardCount).addClass("back").animate({top: topPos, left: leftPos}, 500, finishAnimation);
		// have we reached the end of this row?
		if (cardCount === nextIndex) {
			newRow = true;
			// increase the limit for the next row
			rowLimit += this.defaults.peaks;
			// find the index of the row limit offset
			nextIndex = cardCount + rowLimit;
			// reset top position accordingly
			topPos += this.defaults.topOffset;
			// reset left position accordingly
			startingOffset -= this.defaults.leftOffset;
			leftPos = startingOffset;
			// for each row, we knock a card's width out of the gap.
			gapWidth -= this.defaults.cardWidth;
			// increase the grouping by 1 - grouping is also row count.
			grouping++;
		}
	}
	/* Click handler for the Hole */
	this.hole.$element.on("click", function () {
		Tripeaks.hand.receiveCard(Tripeaks.hole.hitHand()).updateDOM();
		Tripeaks.score.removeFromScore();
		Tripeaks.updateUI();
		// Updates cards left.
		Tripeaks.hole.updateDOM();
	});
	/* Click handler for the cards in the field */
	this.field.getHtmlElements().on("click", function () {
		var $clicked = $(this),
			clickedId = $clicked.attr("id"),
			clickedIndex = (clickedId.split("-")[1]) - 1,
			clickedValue = (Tripeaks.field.getCard(clickedIndex)).getNumber(),
			handVal = Tripeaks.hand.getValue(),
			isPeak = false,
			success = function () {
				if ($clicked.hasClass('peak')) {
					isPeak = true;
				}
				Tripeaks.hand.receiveCard(Tripeaks.field.removeCard(clickedIndex)).updateDOM();
				$clicked.removeClass("fieldCard").hide();
				Tripeaks.score.addToScore(isPeak);
			};
		/* Define an easy way to tell if a card is face-down, and if it is, "lock" the card */
		//if the clicked card is visible...
		if (!$clicked.hasClass("back")) {
			// ...and it's not an ace or a king...
			if ((clickedValue !== 1) && (clickedValue !== 13)) {
				// ...and the card's face value is 1 less or 1 greater than the hand card, remove it from
				// the field and add it to the hand.
				if ((handVal === clickedValue + 1) || (handVal === clickedValue - 1)) {
					success();
				}
			} else if (clickedValue === 13) {
				// what to do if the clicked card is a king
				if ((handVal === 1) || (handVal === clickedValue - 1)) {
					success();
				}
			} else if (clickedValue === 1) {
				// what to do if the clicked card is an ace
				if ((handVal === 13) || (Tripeaks.hand.getValue() === clickedValue + 1)) {
					success();
				}
			}
		}
        // If there is no all-time best run set in local storage and you have local storage, put something here
        if(!Local.read("allTimeBestRun")){ Local.create("allTimeBestRun", "0"); }
		Tripeaks.updateUI();
	});
};
//Stuff in here only runs exactly one time per page load...
(function () {
	/* Start the game. */
	Tripeaks.init();
	/* Reset button */
	$("#newHand").on("click", function () {
		var i;
		for (i = 0; i < Tripeaks.field.getHtmlElements().filter(":visible").length; i++) {
			Tripeaks.score.removeFromScore();
		}
		Tripeaks.score.save();
		// Reset events
		Tripeaks.hole.$element.add(Tripeaks.field.getHtmlElements()).off();
		Tripeaks.init();
		// this is hidden when empty, so show it again
		Tripeaks.hole.$element.show();
	});
	/* Theme switching, toggles a stylesheet loaded from the value of a dropdown. */
	$('#changeTheme').on("change", function () {
		var $switcher = $('#switcher'),
			stylename = this.value;
		if ($switcher.length) {
			$switcher.remove();
		}
        Prefs.setTheme(stylename);
	});
}());