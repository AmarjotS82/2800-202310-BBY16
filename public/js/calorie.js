// script.js
$(document).ready(function() {
  $("body").on("click", "#more", function() {
    
    var circle = document.querySelector("circle");
    var radius = circle.r.baseVal.value;
    var circumference = radius * 2 * Math.PI;
  
    circle.style.strokeDasharray = `${circumference} ${circumference}`;
    circle.style.strokeDashoffset = `${circumference}`;
  
    function setProgress(percent) {
      const offset = circumference - (percent / 100) * circumference;
      circle.style.strokeDashoffset = offset;
    }
    var styles = window.getComputedStyle(circle);

    console.log(styles.getPropertyValue("animation"));
    console.log("val: " + circle.ariaValueNow);
    setProgress(circle.ariaValueNow);
  });
});



