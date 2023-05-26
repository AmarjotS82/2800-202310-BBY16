// javascript that helps make the calorie and carbohydrate page interactive
$(document).ready(function() {
    //Sets the circufrence of the circle by getting the r attribute in the circle element in nutrition.ejs
    var circle = document.querySelector("circle");
    var radius = circle.r.baseVal.value;
    var circumference = radius * 2 * Math.PI;

    //
    circle.style.strokeDasharray = `${circumference} ${circumference}`;
    circle.style.strokeDashoffset = `${circumference}`;

    //sets the progress t
    function setProgress(percent) {
      const offset = circumference - (percent / 100) * circumference;
      circle.style.strokeDashoffset = offset;
    }

    //gets the value or aria-value-now attribute in the circle element and passes it as a parameter into this function
    setProgress(circle.ariaValueNow);
});



