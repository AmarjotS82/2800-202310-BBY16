// script.js
$(document).ready(function() {
  console.log("reached calories.js");
  $("body").on("click", "#amount", function() {
    console.log("clicked add");
    var circle = document.querySelector("circle");
    var radius = circle.r.baseVal.value;
    var circumference = radius * 2 * Math.PI;
   console.log("radius:"+ radius);
    circle.style.strokeDasharray = `${circumference} ${circumference}`;
    circle.style.strokeDashoffset = `${circumference}`;
    console.log("cir:"+ circumfrence);
    function setProgress(percent) {
      console.log("%:"+ percent);
      const offset = circumference - (percent / 100) * circumference;
      circle.style.strokeDashoffset = offset;
    }
    var styles = window.getComputedStyle(circle);

    console.log(styles.getPropertyValue("animation"));
    console.log("val: " + circle.ariaValueNow);
    setProgress(circle.ariaValueNow);
  });


  $("body").on("click", "#goal", function() {
    console.log("clicked goal");
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



