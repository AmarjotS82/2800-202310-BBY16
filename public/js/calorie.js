// javascript that helps make the calorie and carbohydrate page interactive
$(document).ready(function() {
    //Sets the circufrence of the circle by getting the r attribute in the circle element in nutrition.ejs
    var circle = document.querySelector("circle");
    var radius = circle.r.baseVal.value;
    var circumference = radius * 2 * Math.PI;

    // Set the stroke dash pattern to create a complete circle with no gaps
    circle.style.strokeDasharray = `${circumference} ${circumference}`;
    // Offset the circle to make it initially invisible until value is given
    circle.style.strokeDashoffset = `${circumference}`;

    //sets the progress of the circle by getting the percentage as a parameter and show only that much of the circle by offsetting it bty that percent value
    function setProgress(percent) {
    // Gets the percent and turns it into a decimal. Then multiplies it by the circumference of the circle.
    // This gives the length of the visible part that represents  percentage in the circle.
    // Subtracts  this offset from the total length of circle(circunfrence) to give the length of hidden part of the circle.
      const offset = circumference - (percent / 100) * circumference;
      circle.style.strokeDashoffset = offset;
    }

    //gets the value or aria-value-now attribute in the circle element and passes it as a parameter into this function
    setProgress(circle.ariaValueNow);
});



