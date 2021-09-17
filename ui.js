$(document).ready(function() {

    $(startButton).click(function() {
        $(startwrapper).animate({
            left: "7em",
            opacity: "0%",
            maxhHeight: "0%"
        });


        $(document).scrollTop();
        $(hidewrapper).delay(300).animate({
            top: "2em",
            opacity: "100%",
        });



        // document.getElementById("hidewrapper").style.display = "block";
    });


});