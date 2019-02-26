// ==UserScript==
// @name         TicketMasterBuy
// @namespace    http://tampermonkey.net/
// @version      0.4
// @description  Fast execution of reserving tickets in cart
// @match        https://www.ticketmaster.co.uk/*event/*
// @match        https://www1.ticketmaster.co.uk/*event/*
// @match        https://www.ticketmaster.com/*event/*
// @match        https://www1.ticketmaster.com/*event/*
// @match        https://concerts1.livenation.com/*event/*
// @match        https://concerts1.livenation.com/*event/*
// @match        https://www.ticketmaster.ie/*event/*
// @match        https://www1.ticketmaster.ie/*event/*
// @require      https://code.jquery.com/jquery-2.1.3.min.js
// @grant        none
// ==/UserScript==


var refreshIntervalSecondsMin=1; //Set this to how often you want to check for tickets (Note: Do this too fast and TicketMaster may block your ip address)
var refreshIntervalSecondsMax=5;
var numberOfTickets=2; //Set this to the number of tickets you want.  We should prob test out various amounts to see which amounts we should try for.


function getAllCookieNames() {
  var pairs = document.cookie.split(";");
  return pairs.map(function(pair) {
      return (pair.split("=")[0]+'').trim()
  })
}

function deleteAllCookies() {
    getAllCookieNames().map(function(cname) {
        document.cookie = cname+'=;expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;'
    })
}

function SkipPopup()
{
    var popupPresent = getElementByXpath('//button[@class = "modal-dialog__button landing-modal-footer__skip-button"]');
    if(popupPresent)
    {
        try{ popupPresent.click();}catch(ex){}
    }
}

function CheckForFilterPanel(){
    var filterBar = getElementByXpath('//div[@class = "filter-bar__content"]');
    return filterBar;
}

function clickTicketTypeCheckbox(searchString) {
    var selector = "li.checkbox-list__item.checkbox:contains('" + searchString + "')"
    $(selector).children('input').each(function(idx, elmt) {elmt.click()})
}

function clickClearFilters() {
    var selector = "button:contains('Clear')"
    $(selector).each(function(idx, elmt) { elmt.click()})
}

function ProcessFilterPanel(filterBar){
    // We can update this depending on group preferences.
    // For now this:
    // - selects the ticket quantity (numberOfTickets)
    // - filters for standard tickets only (no platinum or resale)
    // - switches to Best Available (instead of Lowest Price)
    // - selects the first tickets in the list
    // - tries again if there's a popup saying someone else bought the tickets already


    // TODO: All these listeners were added haphazardly in testing, I doubt the sequence of actions is as expected
    // (e.g. select filters then select sort order then select quantity then buy).
    // TODO: Kristine might be interested in "soundcheck" packages - we can also check that by calling clickTicketTypeCheckbox
    // example of soundcheck packages: https://www1.ticketmaster.com/the-chainsmokers5-seconds-of-summerlennon-stella-world-war-joy-tour/event/02005646C6716EBF

    //Click ticket type icon
    ClickElement('//*[@id="filter-bar-ticket"]/div[1]/div')

    waitForElement(".false, .unbutton .filter-bar__checkbox-toggle-clear", function () {

        //Clear all filters
        ClickElement('//*[@id="filter-bar-ticket"]/div[2]/div/div[2]/div/div/span[3]/button')

        waitForElement("div#quickpicks-module:contains('Sorry')", function() {

            //Select Standard tickets only
            clickTicketTypeCheckbox("Standard")

            waitForElement('.quick-picks__list-item', function() {

                //Sort by Best Available (instead of Lowest Price).
                ClickElement('//*[@id="quickpicks-module"]/div[1]/div/span[3]')

                waitForElement('.quick-picks__list-item', function() {

                    // Select first ticket offering matching filters
                    ClickElement('(//ul/li[@class = "quick-picks__list-item"])[1]/div/div');

                    //Change ticket quantity (if applicable)
                    waitForElement('.offer-card', function() {

                        //Change the number of tickets (if applicable).
                        //Note: it looks like the increment button is disabled sometimes.
                        //We might want to try this upfront before applying filters/sorting.
                        ChangeTicketQuantity();

                        //Click the button to Buy the tickets (right hand panel)
                        ClickElement('//button[@id = "offer-card-buy-button"]');

                        //Sometimes a dialog comes up if someone else beat us to the tickets.
                        //This dialog gives a recommendation for a new seat selection.
                        //If this occurs, we choose to accept the new seats.
                        waitForElement('.button-aux, .modal-dialog__button', function() {
                            var sectionChangeBuyButton = getElementByXpath('//button[@class = "button-aux modal-dialog__button"]');
                            sectionChangeBuyButton.click();
                        });

                        // Wow this is lame, class order matters.
                        waitForElement('.modal-dialog__button, .button-aux', function() {
                            var sectionChangeBuyButton = getElementByXpath('//button[@class = "modal-dialog__button button-aux"]');
                            sectionChangeBuyButton.click();
                        });
                    });
                })
            })
        })
    })
    
}

function ChangeTicketQuantity()
{
        var rightPanelCurrentTicketCountElement = getElementByXpath('//div[@class = "qty-picker__number qty-picker__number--lg"]');

        var currentTicketCount = rightPanelCurrentTicketCountElement.innerText;

        var ticketQuantityDifference = numberOfTickets - currentTicketCount;
        if (ticketQuantityDifference > 0)
        {
            var ticketIncrementElement = getElementByXpath('//button[@class = "qty-picker__button qty-picker__button--increment qty-picker__button--sm"]');
            for (var i = 0; i < ticketQuantityDifference; i++)
            {
                try{ticketIncrementElement.click();}catch(ex){}
            }
        }
        else if(ticketQuantityDifference < 0)
        {
            ticketQuantityDifference = Math.abs(ticketQuantityDifference);
            var ticketDecrementElement = getElementByXpath('//button[@class = "qty-picker__button qty-picker__button--decrement qty-picker__button--sm"]');
            for (var i = 0; i < ticketQuantityDifference; i++)
            {
                try{ticketDecrementElement.click();}catch(ex){}
            }
        }
}

function CheckForGeneralAdmission()
{
    var BuyButton = getElementByXpath('//button[@id = "offer-card-buy-button"]');
    return BuyButton;
}

function ProcessGeneralAdmission(generalAdmissionBuyButton)
{
    ChangeTicketQuantity();
    generalAdmissionBuyButton.click();
}

function reload() {
    window.top.document.location.replace(window.top.document.location.href);
}


function ClickElement(path, time)
{
    var element = getElementByXpath(path);
    if(element !== null) {
        if (typeof element.click != 'undefined')
        {
            element.click();
            return element;
        }
    }
}

function getElementByXpath(path)
{
  return document.evaluate(path, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
}

var waitForElement = function(selector, callback)
{
  if (jQuery(selector).length) {
    callback();
  } else {
    setTimeout(function() {
      waitForElement(selector, callback);
    }, 100);
  }
};

$(document).ready(function()
{
    var success=false;
    //This popup dialog seems to happen in the US ticketmaster website
    //We just close it down and continue as normal
    SkipPopup();

    //Ticket type 1
    //This occurs in the majority of ticket sales when there is a selection of ticket types
    if(!success)
    {
        var filterBar = CheckForFilterPanel();
        if(filterBar)
        {
            console.log('These tickets have a filter bar');
            success=true;
            ProcessFilterPanel(filterBar);
        }
    }

    //Ticket type 2
    //These tickets are General Admission and do not have assigned seating (i.e. no filter bar)
    if(!success)
    {
        var generalAdmissionBuyButton = CheckForGeneralAdmission();
        if(generalAdmissionBuyButton)
        {
            console.log('These tickets are General Admission');
            success=true;
            ProcessGeneralAdmission(generalAdmissionBuyButton);
        }
    }

    //TODO: Add more ticket types if found

    if(!success)
    {
        // TODO: I don't actually know if we want this.  Once we're in the "Waiting room," it sounds like we'll lose our place in line if we refresh.  So either we turn this off, or only refresh until we get into the waiting room.
        //refresh the page after a random interval between refreshIntervalSecondsMin and refreshIntervalSecondsMax (Tickets weren't yet on sale)
        setTimeout(function(){deleteAllCookies();reload();}, refreshIntervalSecondsMin * 1000 + Math.random() * (refreshIntervalSecondsMax - refreshIntervalSecondsMin) * 1000);
    }
});
