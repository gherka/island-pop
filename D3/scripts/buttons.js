var elements = Array.from(document.getElementsByClassName('button'));
var trigger_l = document.getElementById('btnL');
var trigger_m = document.getElementById('btnM');
var trigger_h = document.getElementById('btnH');    

var selected_btn = 'Low'

trigger_l.addEventListener('click', function() {
    
    elements.forEach(function(d,i) {
        d.classList.remove('passive','active');
        d.classList.add('passive');
    });
    
    elements[0].classList.replace('passive', 'active');
    
    selected_btn = 'Low';
    
});   

trigger_m.addEventListener('click', function() {
    
    elements.forEach(function(d,i) {
        d.classList.remove('passive','active');
        d.classList.add('passive');
    });
    
    elements[1].classList.replace('passive', 'active');
    
    selected_btn = 'Medium';

}); 

trigger_h.addEventListener('click', function() {
    
    elements.forEach(function(d,i) {
        d.classList.remove('passive','active');
        d.classList.add('passive');
    });
    
    elements[2].classList.replace('passive', 'active');
    
    selected_btn = 'High';
    
}); 