const AppleAmmount = 10;
//on window load crate images 

function createApples(){
    for(let index = 0; index < AppleAmmount; index++){

        //set image size
        var AppleImage = new Image(51, 60);

        //set image
        AppleImage.src = 'SmallApple.png';
        var appleId = 'apple_' + index;

        //add attribute's to image
        var $apple = $(AppleImage);
        $apple.attr('id', appleId);
        $apple.addClass('apple-front');
        $apple.attr('alt', 'Apple');

        //append created image to div
        $('.apple-image-box').append($apple);
    }
    
    RandomizeImageLocation()
};

//set parent container size
var containerW = 650;
var containerH = 400;

//track set positions
var positions = [];

function RandomizeImageLocation(){

$('.apple-front').each(function() {
    var coords = {
        w: $(this).outerWidth(true),
        h: $(this).outerHeight(true)
    };
    var success = false;
    while (!success)
    {
        coords.x = parseInt(Math.random() * (containerW-coords.w));
        coords.y = parseInt(Math.random() * (containerH-coords.h));
        var success = true;

        //check positions for overlap
        $.each(positions, function(){
            if (
                coords.x <= (this.x + this.w) &&
                (coords.x + coords.w) >= this.x &&
                coords.y <= (this.y + this.h) &&
                (coords.y + coords.h) >= this.y
            )
            {
                success = false;
            }
        });
    }

    //set coordinates for each apple
    positions.push(coords);
    $(this).css({
        top: coords.y + 'px',
        left: coords.x + 'px'
    });
});

}

// Initialize click counts object and clicked apples counter
let clickCounts = {};
let clickedApples = 0;

// Add click function to apple
$(document).on('click', '.apple-front', function() {
    let imageId = $(this).attr("id");

    // Update click count for the apple and handle its state
    handleAppleClick(imageId);
});

// Handle click on an apple
function handleAppleClick(imageId) {

    // Increment the click count for the apple
    incrementClickCount(imageId);

    // If this is the first click on the apple
    if(clickCounts[imageId] === 1) {

        //Reset apple clickcount for next round
        clickCounts[imageId] = 0;
 
        updateAppleState(imageId);

        // Increment the clicked apples counter and get a random question
        incrementClickedApples();

        playMusic(applePickUpAudio)

        getRandomQuestion(clickedApples);

        //Display quote/question + overlay
        
        //Every 5th apple click display quote

        //Always end on quote 
        if(clickedApples % 5 != 0 && clickedApples < AppleAmmount){    
            $("#apple-back").css("display", "block");
            $("#overlay").css("display", "block");
        
        }else{
            $("#quote-display").css("display", "block");
            $("#overlay").css("display", "block");
            stopMusic(backgroundMusic)
            playMusic(quoteDisplayMusic)
        }
    }
}

//Increment the click count for an apple
function incrementClickCount(imageId) {
    if (!clickCounts[imageId]) {
        clickCounts[imageId] = 0;
    }
    clickCounts[imageId]++;
}

//Update the state of apple
function updateAppleState(imageId) {
    $("#" + imageId).css("display", "none");
}

//Increment the clicked apples counter
function incrementClickedApples() {
    clickedApples++;
}

let level1Items = [];
let level2Items = [];
let levelQuote = [];

fetch('Kysymykset.txt')
    .then(response => response.json())
    .then(data => {
        // Separate the questions based on their level
        level1Items = data.questions.filter(question => question.level === 1);
        level2Items = data.questions.filter(question => question.level === 2);
        levelQuote = data.questions.filter(question => question.level === "quote");
    });

function getRandomQuestion(ClickedApples){
    let levelItems;
    let quote = 0;

    if (ClickedApples < 4) {
        levelItems = level1Items;
    }else if(ClickedApples % 5 == 0 || ClickedApples >= AppleAmmount){
        levelItems = levelQuote;
        quote = 1;
    }else{
        levelItems = level2Items;
    }

    //choose random question
    let randomQuestionIndex = Math.floor(Math.random() * levelItems.length);

    //get index of random question
    let randomQuestion = levelItems[randomQuestionIndex];
    
    // Remove the question from the array
    levelItems.splice(randomQuestionIndex, 1);
    
    // Update quote/question paragraphs      
    if(quote === 1){
        $(".quote-display p").empty();
        $(".quote-display p").text(randomQuestion.question);
    }else{
        $(".apple-back p").empty();
        $(".apple-back p").text(randomQuestion.question);
    }
}

//add click function to question/quote div

document.getElementById('apple-back').addEventListener('click', function() {
    this.style.display = 'none';
    $("#overlay").css("display", "none");
});

document.getElementById('quote-display').addEventListener('click', function() {
    this.style.display = 'none';
    $("#overlay").css("display", "none");
    stopMusic(quoteDisplayMusic)
    playMusic(backgroundMusic)
    //show end menu when last quote div is clicked
    gameEndMenu()
});

//game start/end settings
$(window).on('load', function(){
    $("#start-game").css("display", "block")
    document.getElementById('start-game').addEventListener('click', function() {
        this.style.display = 'none';
    });
}); 

function stopGame(){
    $("#end-game").css("display", "none")
    $("#restart-game").css("display", "none")
    $("#start-game").css("display", "block")
}

function startGame(){
    $('#game-End-Start_Overlay').css("display", "none");
    createApples();
    playMusic(backgroundMusic);
}

function resetGame(){
    resetQuestions();
    resetApples();
    clickedApples = 0;
    $('#game-End-Start_Overlay').css("display", "none");
    playMusic(backgroundMusic)
}

function gameEndMenu(){

    //check last quote state if hidden > show menu
    if($('#overlay').is(':hidden') && clickedApples >= AppleAmmount) {
        $('#game-End-Start_Overlay').css("display","block")
        $("#end-game").css("display", "block")
        $("#restart-game").css("display", "block")
        stopMusic(backgroundMusic)
    }
}

function resetQuestions() {
    fetch('Kysymykset.txt')
        .then(response => response.json())
        .then(data => {
            level1Items = data.questions.filter(question => question.level === 1);
            level2Items = data.questions.filter(question => question.level === 2);
            quote = data.questions.filter(question => question.level === "quote")
        });
}

function resetApples() {
    // Clear the existing apples
    $('.apple-image-box').empty();

    // Create a new set of apples
    for(let index = 0; index < AppleAmmount; index++){
        //set image size
        var AppleImage = new Image(51, 60);

        //set image
        AppleImage.src = 'SmallApple.png';
        var appleId = 'apple_' + index;

        //add attribute's to image
        var $apple = $(AppleImage);
        $apple.attr('id', appleId);
        $apple.addClass('apple-front');
        $apple.attr('alt', 'Apple');

        //append created image to div
        $('.apple-image-box').append($apple);
    }

    // Randomize the location of the apples
    RandomizeImageLocation();
}

// game audio settings

var applePickUpAudio = new Audio("item-pick-up-38258.mp3");
applePickUpAudio.volume = 0.1;

var backgroundMusic = new Audio("Eggy Toast - Ghost.mp3.mp3");
backgroundMusic.volume = 0.1;

//checks if browser supports .loop
if (typeof backgroundMusic.loop == 'boolean') {
    backgroundMusic.loop = true;
} else {
    backgroundMusic.addEventListener('ended', function() {
        this.currentTime = 0;
        this.play();
    }, false);
}

var quoteDisplayMusic = new Audio("Julian Winter - Life's Pace In Slow Motion.mp3");
quoteDisplayMusic.volume = 0.2;

if (typeof quoteDisplayMusic.loop == 'boolean') {
    quoteDisplayMusic.loop = true;
} else {
    quoteDisplayMusic.addEventListener('ended', function() {
        this.currentTime = 0;
        this.play();
    }, false);
}

function playMusic(audio) {
    audio.currentTime = 0; 
    audio.play();
}

function stopMusic(audio) {
    audio.pause();
    audio.currentTime = 0;
}



