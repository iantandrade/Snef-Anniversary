
function resetTimeLine() {
    document.getElementById("25").style.zIndex = 1;
    document.getElementById("25").style.opacity = 0;
    document.getElementById("app").style.zIndex = 100;
    location.reload();
}


class Slider {

    // const currensdsat = updateLegendUI();

    /**
     * @constructor
     * 
     * @param {string} DOM selector
     * @param {number} saida selector
     * @param {array} sliders
     */
    constructor({ DOMselector, saida, sliders }) {
        this.DOMselector = DOMselector;
        this.container = document.querySelector(this.DOMselector);  // Slider container
        this.sliderWidth = 400;                                     // Slider width
        this.sliderHeight = 400;                                    // Slider length
        this.cx = this.sliderWidth / 2;                             // Slider center X coordinate
        this.cy = this.sliderHeight / 2;                            // Slider center Y coordinate
        this.tau = 2 * Math.PI;                                     // Tau constant
        this.sliders = sliders;                                     // Sliders array with opts for each slider
        this.arcFractionSpacing = 0.95;                             // Spacing between arc fractions
        this.arcFractionLength = 90;                                // Arc fraction length
        this.arcFractionThickness = 25;                             // Arc fraction thickness
        this.arcBgFractionColor = '#D8D8D8';                        // Arc fraction color for background slider
        this.handleFillColor = '#fff';                              // Slider handle fill color
        this.handleStrokeColor = '#888888';                         // Slider handle stroke color
        this.handleStrokeThickness = 5;                             // Slider handle stroke thickness    
        this.mouseDown = false;                                     // Is mouse down
        this.activeSlider = null;
    }

    /**
     * Draw sliders on init
     * 
     */
    draw() {

        // Create legend UI
        this.createLegendUI();

        // Create and append SVG holder
        const svgContainer = document.createElement('div');
        svgContainer.classList.add('slider__data');
        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.setAttribute('height', this.sliderWidth);
        svg.setAttribute('width', this.sliderHeight);
        svgContainer.appendChild(svg);
        this.container.appendChild(svgContainer);

        // Draw sliders
        this.sliders.forEach((slider, index) => this.drawSingleSliderOnInit(svg, slider, index));

        // Event listeners
        svgContainer.addEventListener('mousedown', this.mouseTouchStart.bind(this), false);
        svgContainer.addEventListener('touchstart', this.mouseTouchStart.bind(this), false);
        svgContainer.addEventListener('mousemove', this.mouseTouchMove.bind(this), false);
        svgContainer.addEventListener('touchmove', this.mouseTouchMove.bind(this), false);
        window.addEventListener('mouseup', this.mouseTouchEnd.bind(this), false);
        window.addEventListener('touchend', this.mouseTouchEnd.bind(this), false);
    }

    /**
     * Draw single slider on init
     * 
     * @param {object} svg 
     * @param {object} slider 
     * @param {number} index 
     */
    drawSingleSliderOnInit(svg, slider, index) {

        // Default slider opts, if none are set
        slider.radius = slider.radius ?? 50;
        slider.min = slider.min ?? 0;
        slider.max = slider.max ?? 1000;
        slider.step = slider.step ?? 50;
        slider.initialValue = slider.initialValue ?? 0;
        slider.color = slider.color ?? '#FF5733';

        // Calculate slider circumference
        const circumference = slider.radius * this.tau;

        // Calculate initial angle
        const initialAngle = Math.floor((slider.initialValue / (slider.max - slider.min)) * 360);

        // Calculate spacing between arc fractions
        const arcFractionSpacing = this.calculateSpacingBetweenArcFractions(circumference, this.arcFractionLength, this.arcFractionSpacing);

        // Create a single slider group - holds all paths and handle
        const sliderGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        sliderGroup.setAttribute('class', 'sliderSingle');
        sliderGroup.setAttribute('data-slider', index);
        sliderGroup.setAttribute('transform', 'rotate(-90,' + this.cx + ',' + this.cy + ')');
        sliderGroup.setAttribute('rad', slider.radius);
        svg.appendChild(sliderGroup);

        // Draw background arc path
        this.drawArcPath(this.arcBgFractionColor, slider.radius, 360, arcFractionSpacing, 'bg', sliderGroup);

        // Draw active arc path
        this.drawArcPath(slider.color, slider.radius, initialAngle, arcFractionSpacing, 'active', sliderGroup);

        // Draw handle
        this.drawHandle(slider, initialAngle, sliderGroup);
    }

    /**
     * Output arch path
     * 
     * @param {number} cx 
     * @param {number} cy 
     * @param {string} color 
     * @param {number} angle 
     * @param {number} singleSpacing 
     * @param {string} type 
     */
    drawArcPath(color, radius, angle, singleSpacing, type, group) {

        // Slider path class
        const pathClass = (type === 'active') ? 'sliderSinglePathActive' : 'sliderSinglePath';

        // Create svg path
        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        path.classList.add(pathClass);
        path.setAttribute('d', this.describeArc(this.cx, this.cy, radius, 0, angle));
        path.style.stroke = color;
        path.style.strokeWidth = this.arcFractionThickness;
        path.style.fill = 'none';
        path.setAttribute('stroke-dasharray', this.arcFractionLength + ' ' + singleSpacing);
        group.appendChild(path);
    }

    /**
     * Draw handle for single slider
     * 
     * @param {object} slider 
     * @param {number} initialAngle 
     * @param {group} group 
     */
    drawHandle(slider, initialAngle, group) {

        // Calculate handle center
        const handleCenter = this.calculateHandleCenter(initialAngle * this.tau / 360, slider.radius);

        // Draw handle
        const handle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        handle.setAttribute('class', 'sliderHandle');
        handle.setAttribute('cx', handleCenter.x);
        handle.setAttribute('cy', handleCenter.y);
        handle.setAttribute('r', this.arcFractionThickness / 2);
        handle.style.stroke = this.handleStrokeColor;
        handle.style.strokeWidth = this.handleStrokeThickness;
        handle.style.fill = this.handleFillColor;
        group.appendChild(handle);
    }

    /**
     * Create legend UI on init
     * 
     */
    createLegendUI() {
        let valor = slider.initialValue;
        // Create legend
        const display = document.createElement('ul');
        display.classList.add('slider__legend');

        // Legend heading
        const heading = document.createElement('h2');
        heading.innerText = 'EVOLUÇÃO';
        display.appendChild(heading);

        // Legend data for all sliders
        this.sliders.forEach((slider, index) => {
            const li = document.createElement('li');
            li.setAttribute('data-slider', index);
            const firstSpan = document.createElement('span');
            firstSpan.style.backgroundColor = slider.color ?? '#FF5733';
            firstSpan.classList.add('colorSquare');
            const secondSpan = document.createElement('span');
            secondSpan.innerText = slider.displayName ?? 'Unnamed value';
            const thirdSpan = document.createElement('span');
            thirdSpan.innerText = slider.initialValue ?? 0;
            thirdSpan.classList.add('sliderValue');

            li.appendChild(firstSpan);
            li.appendChild(secondSpan);
            li.appendChild(thirdSpan);
            display.appendChild(li);
        });

        // Append to DOM
        this.container.appendChild(display);
    }

    /**
     * Redraw active slider
     * 
     * @param {element} activeSlider
     * @param {obj} rmc
     */
    redrawActiveSlider(rmc) {
        const activePath = this.activeSlider.querySelector('.sliderSinglePathActive');
        const radius = +this.activeSlider.getAttribute('rad');
        const currentAngle = this.calculateMouseAngle(rmc) * 0.999;

        // Redraw active path
        activePath.setAttribute('d', this.describeArc(this.cx, this.cy, radius, 0, this.radiansToDegrees(currentAngle)));

        // Redraw handle
        const handle = this.activeSlider.querySelector('.sliderHandle');
        const handleCenter = this.calculateHandleCenter(currentAngle, radius);
        handle.setAttribute('cx', handleCenter.x);
        handle.setAttribute('cy', handleCenter.y);

        // Update legend
        this.updateLegendUI(currentAngle);
    }

    /**
     * Update legend UI
     * 
     * @param {number} currentAngle 
     */
    updateLegendUI(currentAngle) {
        const targetSlider = this.activeSlider.getAttribute('data-slider');
        const targetLegend = document.querySelector(`li[data-slider="${targetSlider}"] .sliderValue`);
        const currentSlider = this.sliders[targetSlider];
        const currentSliderRange = currentSlider.max - currentSlider.min;
        let currentValue = currentAngle / this.tau * currentSliderRange;
        const numOfSteps = Math.round(currentValue / currentSlider.step);
        currentValue = currentSlider.min + numOfSteps * currentSlider.step;
        targetLegend.innerText = currentValue;

        if (currentValue > 1900 && currentValue < 1915) {
            document.getElementById("1").style.opacity = 1;
            document.getElementById("2").style.opacity = 0;
            document.getElementById("3").style.opacity = 0;
            document.getElementById("4").style.opacity = 0;
            document.getElementById("5").style.opacity = 0;
            document.getElementById("6").style.opacity = 0;
            document.getElementById("7").style.opacity = 0;
            document.getElementById("8").style.opacity = 0;
            document.getElementById("9").style.opacity = 0;
            document.getElementById("10").style.opacity = 0;
            document.getElementById("11").style.opacity = 0;
            document.getElementById("12").style.opacity = 0;
            document.getElementById("14").style.opacity = 0;
            document.getElementById("15").style.opacity = 0;
            document.getElementById("16").style.opacity = 0;
            document.getElementById("17").style.opacity = 0;
            document.getElementById("18").style.opacity = 0;
            document.getElementById("19").style.opacity = 0;
            document.getElementById("20").style.opacity = 0;
            document.getElementById("21").style.opacity = 0;
            document.getElementById("22").style.opacity = 0;
            document.getElementById("23").style.opacity = 0;
            document.getElementById("24").style.opacity = 0;
            document.getElementById("25").style.opacity = 0;

        }
        else if (currentValue > 1915 && currentValue < 1920) {
            document.getElementById("1").style.opacity = 0;
            document.getElementById("2").style.opacity = 1;
            document.getElementById("3").style.opacity = 0;
            document.getElementById("4").style.opacity = 0;
            document.getElementById("5").style.opacity = 0;
            document.getElementById("6").style.opacity = 0;
            document.getElementById("7").style.opacity = 0;
            document.getElementById("8").style.opacity = 0;
            document.getElementById("9").style.opacity = 0;
            document.getElementById("10").style.opacity = 0;
            document.getElementById("11").style.opacity = 0;
            document.getElementById("12").style.opacity = 0;
            document.getElementById("14").style.opacity = 0;
            document.getElementById("15").style.opacity = 0;
            document.getElementById("16").style.opacity = 0;
            document.getElementById("17").style.opacity = 0;
            document.getElementById("18").style.opacity = 0;
            document.getElementById("19").style.opacity = 0;
            document.getElementById("20").style.opacity = 0;
            document.getElementById("21").style.opacity = 0;
            document.getElementById("22").style.opacity = 0;
            document.getElementById("23").style.opacity = 0;
            document.getElementById("24").style.opacity = 0;
            document.getElementById("25").style.opacity = 0;
        }
        else if (currentValue > 1920 && currentValue < 1925) {
            document.getElementById("1").style.opacity = 0;
            document.getElementById("2").style.opacity = 0;
            document.getElementById("3").style.opacity = 1;
            document.getElementById("4").style.opacity = 0;
            document.getElementById("5").style.opacity = 0;
            document.getElementById("6").style.opacity = 0;
            document.getElementById("7").style.opacity = 0;
            document.getElementById("8").style.opacity = 0;
            document.getElementById("9").style.opacity = 0;
            document.getElementById("10").style.opacity = 0;
            document.getElementById("11").style.opacity = 0;
            document.getElementById("12").style.opacity = 0;
            document.getElementById("14").style.opacity = 0;
            document.getElementById("15").style.opacity = 0;
            document.getElementById("16").style.opacity = 0;
            document.getElementById("17").style.opacity = 0;
            document.getElementById("18").style.opacity = 0;
            document.getElementById("19").style.opacity = 0;
            document.getElementById("20").style.opacity = 0;
            document.getElementById("21").style.opacity = 0;
            document.getElementById("22").style.opacity = 0;
            document.getElementById("23").style.opacity = 0;
            document.getElementById("24").style.opacity = 0;
            document.getElementById("25").style.opacity = 0;
        }

        else if (currentValue > 1925 && currentValue < 1930) {
            document.getElementById("1").style.opacity = 0;
            document.getElementById("2").style.opacity = 0;
            document.getElementById("3").style.opacity = 1;
            document.getElementById("4").style.opacity = 0;
            document.getElementById("5").style.opacity = 0;
            document.getElementById("6").style.opacity = 0;
            document.getElementById("7").style.opacity = 0;
            document.getElementById("8").style.opacity = 0;
            document.getElementById("9").style.opacity = 0;
            document.getElementById("10").style.opacity = 0;
            document.getElementById("11").style.opacity = 0;
            document.getElementById("12").style.opacity = 0;
            document.getElementById("14").style.opacity = 0;
            document.getElementById("15").style.opacity = 0;
            document.getElementById("16").style.opacity = 0;
            document.getElementById("17").style.opacity = 0;
            document.getElementById("18").style.opacity = 0;
            document.getElementById("19").style.opacity = 0;
            document.getElementById("20").style.opacity = 0;
            document.getElementById("21").style.opacity = 0;
            document.getElementById("22").style.opacity = 0;
            document.getElementById("23").style.opacity = 0;
            document.getElementById("24").style.opacity = 0;
            document.getElementById("25").style.opacity = 0;
        }
        else if (currentValue > 1930 && currentValue < 1945) {
            document.getElementById("1").style.opacity = 0;
            document.getElementById("2").style.opacity = 0;
            document.getElementById("3").style.opacity = 0;
            document.getElementById("4").style.opacity = 1;
            document.getElementById("5").style.opacity = 0;
            document.getElementById("6").style.opacity = 0;
            document.getElementById("7").style.opacity = 0;
            document.getElementById("8").style.opacity = 0;
            document.getElementById("9").style.opacity = 0;
            document.getElementById("10").style.opacity = 0;
            document.getElementById("11").style.opacity = 0;
            document.getElementById("12").style.opacity = 0;
            document.getElementById("14").style.opacity = 0;
            document.getElementById("15").style.opacity = 0;
            document.getElementById("16").style.opacity = 0;
            document.getElementById("17").style.opacity = 0;
            document.getElementById("18").style.opacity = 0;
            document.getElementById("19").style.opacity = 0;
            document.getElementById("20").style.opacity = 0;
            document.getElementById("21").style.opacity = 0;
            document.getElementById("22").style.opacity = 0;
            document.getElementById("23").style.opacity = 0;
            document.getElementById("24").style.opacity = 0;
            document.getElementById("25").style.opacity = 0;
        }
        else if (currentValue > 1945 && currentValue < 1962) {
            document.getElementById("1").style.opacity = 0;
            document.getElementById("2").style.opacity = 0;
            document.getElementById("3").style.opacity = 0;
            document.getElementById("4").style.opacity = 0;
            document.getElementById("5").style.opacity = 1;
            document.getElementById("6").style.opacity = 0;
            document.getElementById("7").style.opacity = 0;
            document.getElementById("8").style.opacity = 0;
            document.getElementById("9").style.opacity = 0;
            document.getElementById("10").style.opacity = 0;
            document.getElementById("11").style.opacity = 0;
            document.getElementById("12").style.opacity = 0;
            document.getElementById("14").style.opacity = 0;
            document.getElementById("15").style.opacity = 0;
            document.getElementById("16").style.opacity = 0;
            document.getElementById("17").style.opacity = 0;
            document.getElementById("18").style.opacity = 0;
            document.getElementById("19").style.opacity = 0;
            document.getElementById("20").style.opacity = 0;
            document.getElementById("21").style.opacity = 0;
            document.getElementById("22").style.opacity = 0;
            document.getElementById("23").style.opacity = 0;
            document.getElementById("24").style.opacity = 0;
            document.getElementById("25").style.opacity = 0;
        }
        else if (currentValue > 1962 && currentValue < 1972) {
            document.getElementById("1").style.opacity = 0;
            document.getElementById("2").style.opacity = 0;
            document.getElementById("3").style.opacity = 0;
            document.getElementById("4").style.opacity = 0;
            document.getElementById("5").style.opacity = 0;
            document.getElementById("6").style.opacity = 1;
            document.getElementById("7").style.opacity = 0;
            document.getElementById("8").style.opacity = 0;
            document.getElementById("9").style.opacity = 0;
            document.getElementById("10").style.opacity = 0;
            document.getElementById("11").style.opacity = 0;
            document.getElementById("12").style.opacity = 0;
            document.getElementById("14").style.opacity = 0;
            document.getElementById("15").style.opacity = 0;
            document.getElementById("16").style.opacity = 0;
            document.getElementById("17").style.opacity = 0;
            document.getElementById("18").style.opacity = 0;
            document.getElementById("19").style.opacity = 0;
            document.getElementById("20").style.opacity = 0;
            document.getElementById("21").style.opacity = 0;
            document.getElementById("22").style.opacity = 0;
            document.getElementById("23").style.opacity = 0;
            document.getElementById("24").style.opacity = 0;
            document.getElementById("25").style.opacity = 0;
        }
        else if (currentValue > 1972 && currentValue < 1980) {
            document.getElementById("1").style.opacity = 0;
            document.getElementById("2").style.opacity = 0;
            document.getElementById("3").style.opacity = 0;
            document.getElementById("4").style.opacity = 0;
            document.getElementById("5").style.opacity = 0;
            document.getElementById("6").style.opacity = 0;
            document.getElementById("7").style.opacity = 1;
            document.getElementById("8").style.opacity = 0;
            document.getElementById("9").style.opacity = 0;
            document.getElementById("10").style.opacity = 0;
            document.getElementById("11").style.opacity = 0;
            document.getElementById("12").style.opacity = 0;
            document.getElementById("14").style.opacity = 0;
            document.getElementById("15").style.opacity = 0;
            document.getElementById("16").style.opacity = 0;
            document.getElementById("17").style.opacity = 0;
            document.getElementById("18").style.opacity = 0;
            document.getElementById("19").style.opacity = 0;
            document.getElementById("20").style.opacity = 0;
            document.getElementById("21").style.opacity = 0;
            document.getElementById("22").style.opacity = 0;
            document.getElementById("23").style.opacity = 0;
            document.getElementById("24").style.opacity = 0;
            document.getElementById("25").style.opacity = 0;
        }
        else if (currentValue > 1980 && currentValue < 1984) {
            document.getElementById("1").style.opacity = 0;
            document.getElementById("2").style.opacity = 0;
            document.getElementById("3").style.opacity = 0;
            document.getElementById("4").style.opacity = 0;
            document.getElementById("5").style.opacity = 0;
            document.getElementById("6").style.opacity = 0;
            document.getElementById("7").style.opacity = 0;
            document.getElementById("8").style.opacity = 1;
            document.getElementById("9").style.opacity = 0;
            document.getElementById("10").style.opacity = 0;
            document.getElementById("11").style.opacity = 0;
            document.getElementById("12").style.opacity = 0;
            document.getElementById("14").style.opacity = 0;
            document.getElementById("15").style.opacity = 0;
            document.getElementById("16").style.opacity = 0;
            document.getElementById("17").style.opacity = 0;
            document.getElementById("18").style.opacity = 0;
            document.getElementById("19").style.opacity = 0;
            document.getElementById("20").style.opacity = 0;
            document.getElementById("21").style.opacity = 0;
            document.getElementById("22").style.opacity = 0;
            document.getElementById("23").style.opacity = 0;
            document.getElementById("24").style.opacity = 0;
            document.getElementById("25").style.opacity = 0;
        }
        else if (currentValue > 1984 && currentValue < 1988) {
            document.getElementById("1").style.opacity = 0;
            document.getElementById("2").style.opacity = 0;
            document.getElementById("3").style.opacity = 0;
            document.getElementById("4").style.opacity = 0;
            document.getElementById("5").style.opacity = 0;
            document.getElementById("6").style.opacity = 0;
            document.getElementById("7").style.opacity = 0;
            document.getElementById("8").style.opacity = 0;
            document.getElementById("9").style.opacity = 1;
            document.getElementById("10").style.opacity = 0;
            document.getElementById("11").style.opacity = 0;
            document.getElementById("12").style.opacity = 0;
            document.getElementById("14").style.opacity = 0;
            document.getElementById("15").style.opacity = 0;
            document.getElementById("16").style.opacity = 0;
            document.getElementById("17").style.opacity = 0;
            document.getElementById("18").style.opacity = 0;
            document.getElementById("19").style.opacity = 0;
            document.getElementById("20").style.opacity = 0;
            document.getElementById("21").style.opacity = 0;
            document.getElementById("22").style.opacity = 0;
            document.getElementById("23").style.opacity = 0;
            document.getElementById("24").style.opacity = 0;
            document.getElementById("25").style.opacity = 0;
        }
        else if (currentValue > 1988 && currentValue < 1992) {
            document.getElementById("1").style.opacity = 0;
            document.getElementById("2").style.opacity = 0;
            document.getElementById("3").style.opacity = 0;
            document.getElementById("4").style.opacity = 0;
            document.getElementById("5").style.opacity = 0;
            document.getElementById("6").style.opacity = 0;
            document.getElementById("7").style.opacity = 0;
            document.getElementById("8").style.opacity = 0;
            document.getElementById("9").style.opacity = 0;
            document.getElementById("10").style.opacity = 1;
            document.getElementById("11").style.opacity = 0;
            document.getElementById("12").style.opacity = 0;
            document.getElementById("14").style.opacity = 0;
            document.getElementById("15").style.opacity = 0;
            document.getElementById("16").style.opacity = 0;
            document.getElementById("17").style.opacity = 0;
            document.getElementById("18").style.opacity = 0;
            document.getElementById("19").style.opacity = 0;
            document.getElementById("20").style.opacity = 0;
            document.getElementById("21").style.opacity = 0;
            document.getElementById("22").style.opacity = 0;
            document.getElementById("23").style.opacity = 0;
            document.getElementById("24").style.opacity = 0;
            document.getElementById("25").style.opacity = 0;
        }
        else if (currentValue > 1992 && currentValue < 1994) {
            document.getElementById("1").style.opacity = 0;
            document.getElementById("2").style.opacity = 0;
            document.getElementById("3").style.opacity = 0;
            document.getElementById("4").style.opacity = 0;
            document.getElementById("5").style.opacity = 0;
            document.getElementById("6").style.opacity = 0;
            document.getElementById("7").style.opacity = 0;
            document.getElementById("8").style.opacity = 0;
            document.getElementById("9").style.opacity = 0;
            document.getElementById("10").style.opacity = 0;
            document.getElementById("11").style.opacity = 1;
            document.getElementById("12").style.opacity = 0;
            document.getElementById("14").style.opacity = 0;
            document.getElementById("15").style.opacity = 0;
            document.getElementById("16").style.opacity = 0;
            document.getElementById("17").style.opacity = 0;
            document.getElementById("18").style.opacity = 0;
            document.getElementById("19").style.opacity = 0;
            document.getElementById("20").style.opacity = 0;
            document.getElementById("21").style.opacity = 0;
            document.getElementById("22").style.opacity = 0;
            document.getElementById("23").style.opacity = 0;
            document.getElementById("24").style.opacity = 0;
            document.getElementById("25").style.opacity = 0;
        }
        else if (currentValue > 1994 && currentValue < 1997) {
            document.getElementById("1").style.opacity = 0;
            document.getElementById("2").style.opacity = 0;
            document.getElementById("3").style.opacity = 0;
            document.getElementById("4").style.opacity = 0;
            document.getElementById("5").style.opacity = 0;
            document.getElementById("6").style.opacity = 0;
            document.getElementById("7").style.opacity = 0;
            document.getElementById("8").style.opacity = 0;
            document.getElementById("9").style.opacity = 0;
            document.getElementById("10").style.opacity = 0;
            document.getElementById("11").style.opacity = 1;
            document.getElementById("12").style.opacity = 0;
            document.getElementById("14").style.opacity = 0;
            document.getElementById("15").style.opacity = 0;
            document.getElementById("16").style.opacity = 0;
            document.getElementById("17").style.opacity = 0;
            document.getElementById("18").style.opacity = 0;
            document.getElementById("19").style.opacity = 0;
            document.getElementById("20").style.opacity = 0;
            document.getElementById("21").style.opacity = 0;
            document.getElementById("22").style.opacity = 0;
            document.getElementById("23").style.opacity = 0;
            document.getElementById("24").style.opacity = 0;
            document.getElementById("25").style.opacity = 0;
        }
        else if (currentValue > 1997 && currentValue < 1999) {
            document.getElementById("1").style.opacity = 0;
            document.getElementById("2").style.opacity = 0;
            document.getElementById("3").style.opacity = 0;
            document.getElementById("4").style.opacity = 0;
            document.getElementById("5").style.opacity = 0;
            document.getElementById("6").style.opacity = 0;
            document.getElementById("7").style.opacity = 0;
            document.getElementById("8").style.opacity = 0;
            document.getElementById("9").style.opacity = 0;
            document.getElementById("10").style.opacity = 0;
            document.getElementById("11").style.opacity = 0;
            document.getElementById("12").style.opacity = 1;
            document.getElementById("14").style.opacity = 0;
            document.getElementById("15").style.opacity = 0;
            document.getElementById("16").style.opacity = 0;
            document.getElementById("17").style.opacity = 0;
            document.getElementById("18").style.opacity = 0;
            document.getElementById("19").style.opacity = 0;
            document.getElementById("20").style.opacity = 0;
            document.getElementById("21").style.opacity = 0;
            document.getElementById("22").style.opacity = 0;
            document.getElementById("23").style.opacity = 0;
            document.getElementById("24").style.opacity = 0;
            document.getElementById("25").style.opacity = 0;
        }
        else if (currentValue > 1999 && currentValue < 2001) {
            document.getElementById("1").style.opacity = 0;
            document.getElementById("2").style.opacity = 0;
            document.getElementById("3").style.opacity = 0;
            document.getElementById("4").style.opacity = 0;
            document.getElementById("5").style.opacity = 0;
            document.getElementById("6").style.opacity = 0;
            document.getElementById("7").style.opacity = 0;
            document.getElementById("8").style.opacity = 0;
            document.getElementById("9").style.opacity = 0;
            document.getElementById("10").style.opacity = 0;
            document.getElementById("11").style.opacity = 0;
            document.getElementById("12").style.opacity = 0;
            document.getElementById("14").style.opacity = 1;
            document.getElementById("15").style.opacity = 0;
            document.getElementById("16").style.opacity = 0;
            document.getElementById("17").style.opacity = 0;
            document.getElementById("18").style.opacity = 0;
            document.getElementById("19").style.opacity = 0;
            document.getElementById("20").style.opacity = 0;
            document.getElementById("21").style.opacity = 0;
            document.getElementById("22").style.opacity = 0;
            document.getElementById("23").style.opacity = 0;
            document.getElementById("24").style.opacity = 0;
            document.getElementById("25").style.opacity = 0;
        }
        else if (currentValue > 2001 && currentValue < 2004) {
            document.getElementById("1").style.opacity = 0;
            document.getElementById("2").style.opacity = 0;
            document.getElementById("3").style.opacity = 0;
            document.getElementById("4").style.opacity = 0;
            document.getElementById("5").style.opacity = 0;
            document.getElementById("6").style.opacity = 0;
            document.getElementById("7").style.opacity = 0;
            document.getElementById("8").style.opacity = 0;
            document.getElementById("9").style.opacity = 0;
            document.getElementById("10").style.opacity = 0;
            document.getElementById("11").style.opacity = 0;
            document.getElementById("12").style.opacity = 0;
            document.getElementById("14").style.opacity = 0;
            document.getElementById("15").style.opacity = 1;
            document.getElementById("16").style.opacity = 0;
            document.getElementById("17").style.opacity = 0;
            document.getElementById("18").style.opacity = 0;
            document.getElementById("19").style.opacity = 0;
            document.getElementById("20").style.opacity = 0;
            document.getElementById("21").style.opacity = 0;
            document.getElementById("22").style.opacity = 0;
            document.getElementById("23").style.opacity = 0;
            document.getElementById("24").style.opacity = 0;
            document.getElementById("25").style.opacity = 0;
        }
        else if (currentValue > 2004 && currentValue < 2009) {
            document.getElementById("1").style.opacity = 0;
            document.getElementById("2").style.opacity = 0;
            document.getElementById("3").style.opacity = 0;
            document.getElementById("4").style.opacity = 0;
            document.getElementById("5").style.opacity = 0;
            document.getElementById("6").style.opacity = 0;
            document.getElementById("7").style.opacity = 0;
            document.getElementById("8").style.opacity = 0;
            document.getElementById("9").style.opacity = 0;
            document.getElementById("10").style.opacity = 0;
            document.getElementById("11").style.opacity = 0;
            document.getElementById("12").style.opacity = 0;
            document.getElementById("14").style.opacity = 0;
            document.getElementById("15").style.opacity = 0;
            document.getElementById("16").style.opacity = 1;
            document.getElementById("17").style.opacity = 0;
            document.getElementById("18").style.opacity = 0;
            document.getElementById("19").style.opacity = 0;
            document.getElementById("20").style.opacity = 0;
            document.getElementById("21").style.opacity = 0;
            document.getElementById("22").style.opacity = 0;
            document.getElementById("23").style.opacity = 0;
            document.getElementById("24").style.opacity = 0;
            document.getElementById("25").style.opacity = 0;
        }
        else if (currentValue > 2009 && currentValue < 2012) {
            document.getElementById("1").style.opacity = 0;
            document.getElementById("2").style.opacity = 0;
            document.getElementById("3").style.opacity = 0;
            document.getElementById("4").style.opacity = 0;
            document.getElementById("5").style.opacity = 0;
            document.getElementById("6").style.opacity = 0;
            document.getElementById("7").style.opacity = 0;
            document.getElementById("8").style.opacity = 0;
            document.getElementById("9").style.opacity = 0;
            document.getElementById("10").style.opacity = 0;
            document.getElementById("11").style.opacity = 0;
            document.getElementById("12").style.opacity = 0;
            document.getElementById("14").style.opacity = 0;
            document.getElementById("15").style.opacity = 0;
            document.getElementById("16").style.opacity = 0;
            document.getElementById("17").style.opacity = 1;
            document.getElementById("18").style.opacity = 0;
            document.getElementById("19").style.opacity = 0;
            document.getElementById("20").style.opacity = 0;
            document.getElementById("21").style.opacity = 0;
            document.getElementById("22").style.opacity = 0;
            document.getElementById("23").style.opacity = 0;
            document.getElementById("24").style.opacity = 0;
            document.getElementById("25").style.opacity = 0;
        }
        else if (currentValue > 2012 && currentValue < 2017) {
            document.getElementById("1").style.opacity = 0;
            document.getElementById("2").style.opacity = 0;
            document.getElementById("3").style.opacity = 0;
            document.getElementById("4").style.opacity = 0;
            document.getElementById("5").style.opacity = 0;
            document.getElementById("6").style.opacity = 0;
            document.getElementById("7").style.opacity = 0;
            document.getElementById("8").style.opacity = 0;
            document.getElementById("9").style.opacity = 0;
            document.getElementById("10").style.opacity = 0;
            document.getElementById("11").style.opacity = 0;
            document.getElementById("12").style.opacity = 0;
            document.getElementById("14").style.opacity = 0;
            document.getElementById("15").style.opacity = 0;
            document.getElementById("16").style.opacity = 0;
            document.getElementById("17").style.opacity = 0;
            document.getElementById("18").style.opacity = 1;
            document.getElementById("19").style.opacity = 0;
            document.getElementById("20").style.opacity = 0;
            document.getElementById("21").style.opacity = 0;
            document.getElementById("22").style.opacity = 0;
            document.getElementById("23").style.opacity = 0;
            document.getElementById("24").style.opacity = 0;
            document.getElementById("25").style.opacity = 0;
        }
        else if (currentValue == 2017) {
            document.getElementById("1").style.opacity = 0;
            document.getElementById("2").style.opacity = 0;
            document.getElementById("3").style.opacity = 0;
            document.getElementById("4").style.opacity = 0;
            document.getElementById("5").style.opacity = 0;
            document.getElementById("6").style.opacity = 0;
            document.getElementById("7").style.opacity = 0;
            document.getElementById("8").style.opacity = 0;
            document.getElementById("9").style.opacity = 0;
            document.getElementById("10").style.opacity = 0;
            document.getElementById("11").style.opacity = 0;
            document.getElementById("12").style.opacity = 0;
            document.getElementById("14").style.opacity = 0;
            document.getElementById("15").style.opacity = 0;
            document.getElementById("16").style.opacity = 0;
            document.getElementById("17").style.opacity = 0;
            document.getElementById("18").style.opacity = 0;
            document.getElementById("19").style.opacity = 1;
            document.getElementById("20").style.opacity = 0;
            document.getElementById("21").style.opacity = 0;
            document.getElementById("22").style.opacity = 0;
            document.getElementById("23").style.opacity = 0;
            document.getElementById("24").style.opacity = 0;
            document.getElementById("25").style.opacity = 0;
        }
        else if (currentValue == 2018) {
            document.getElementById("1").style.opacity = 0;
            document.getElementById("2").style.opacity = 0;
            document.getElementById("3").style.opacity = 0;
            document.getElementById("4").style.opacity = 0;
            document.getElementById("5").style.opacity = 0;
            document.getElementById("6").style.opacity = 0;
            document.getElementById("7").style.opacity = 0;
            document.getElementById("8").style.opacity = 0;
            document.getElementById("9").style.opacity = 0;
            document.getElementById("10").style.opacity = 0;
            document.getElementById("11").style.opacity = 0;
            document.getElementById("12").style.opacity = 0;
            document.getElementById("14").style.opacity = 0;
            document.getElementById("15").style.opacity = 0;
            document.getElementById("16").style.opacity = 0;
            document.getElementById("17").style.opacity = 0;
            document.getElementById("18").style.opacity = 0;
            document.getElementById("19").style.opacity = 0;
            document.getElementById("20").style.opacity = 1;
            document.getElementById("21").style.opacity = 0;
            document.getElementById("22").style.opacity = 0;
            document.getElementById("23").style.opacity = 0;
            document.getElementById("24").style.opacity = 0;
            document.getElementById("25").style.opacity = 0;
        }
        else if (currentValue == 2019) {
            document.getElementById("1").style.opacity = 0;
            document.getElementById("2").style.opacity = 0;
            document.getElementById("3").style.opacity = 0;
            document.getElementById("4").style.opacity = 0;
            document.getElementById("5").style.opacity = 0;
            document.getElementById("6").style.opacity = 0;
            document.getElementById("7").style.opacity = 0;
            document.getElementById("8").style.opacity = 0;
            document.getElementById("9").style.opacity = 0;
            document.getElementById("10").style.opacity = 0;
            document.getElementById("11").style.opacity = 0;
            document.getElementById("12").style.opacity = 0;
            document.getElementById("14").style.opacity = 0;
            document.getElementById("15").style.opacity = 0;
            document.getElementById("16").style.opacity = 0;
            document.getElementById("17").style.opacity = 0;
            document.getElementById("18").style.opacity = 0;
            document.getElementById("19").style.opacity = 0;
            document.getElementById("20").style.opacity = 0;
            document.getElementById("21").style.opacity = 1;
            document.getElementById("22").style.opacity = 0;
            document.getElementById("23").style.opacity = 0;
            document.getElementById("24").style.opacity = 0;
            document.getElementById("25").style.opacity = 0;
        }
        else if (currentValue == 2020) {
            document.getElementById("1").style.opacity = 0;
            document.getElementById("2").style.opacity = 0;
            document.getElementById("3").style.opacity = 0;
            document.getElementById("4").style.opacity = 0;
            document.getElementById("5").style.opacity = 0;
            document.getElementById("6").style.opacity = 0;
            document.getElementById("7").style.opacity = 0;
            document.getElementById("8").style.opacity = 0;
            document.getElementById("9").style.opacity = 0;
            document.getElementById("10").style.opacity = 0;
            document.getElementById("11").style.opacity = 0;
            document.getElementById("12").style.opacity = 0;
            document.getElementById("14").style.opacity = 0;
            document.getElementById("15").style.opacity = 0;
            document.getElementById("16").style.opacity = 0;
            document.getElementById("17").style.opacity = 0;
            document.getElementById("18").style.opacity = 0;
            document.getElementById("19").style.opacity = 0;
            document.getElementById("20").style.opacity = 0;
            document.getElementById("21").style.opacity = 0;
            document.getElementById("22").style.opacity = 1;
            document.getElementById("23").style.opacity = 0;
            document.getElementById("24").style.opacity = 0;
            document.getElementById("25").style.opacity = 0;
        }
        else if (currentValue == 2021) {
            document.getElementById("1").style.opacity = 0;
            document.getElementById("2").style.opacity = 0;
            document.getElementById("3").style.opacity = 0;
            document.getElementById("4").style.opacity = 0;
            document.getElementById("5").style.opacity = 0;
            document.getElementById("6").style.opacity = 0;
            document.getElementById("7").style.opacity = 0;
            document.getElementById("8").style.opacity = 0;
            document.getElementById("9").style.opacity = 0;
            document.getElementById("10").style.opacity = 0;
            document.getElementById("11").style.opacity = 0;
            document.getElementById("12").style.opacity = 0;
            document.getElementById("14").style.opacity = 0;
            document.getElementById("15").style.opacity = 0;
            document.getElementById("16").style.opacity = 0;
            document.getElementById("17").style.opacity = 0;
            document.getElementById("18").style.opacity = 0;
            document.getElementById("19").style.opacity = 0;
            document.getElementById("20").style.opacity = 0;
            document.getElementById("21").style.opacity = 0;
            document.getElementById("22").style.opacity = 0;
            document.getElementById("23").style.opacity = 0;
            document.getElementById("24").style.opacity = 1;
            document.getElementById("25").style.opacity = 0;
        }
        else if (currentValue >= 2022) {
            document.getElementById("1").style.opacity = 0;
            document.getElementById("2").style.opacity = 0;
            document.getElementById("3").style.opacity = 0;
            document.getElementById("4").style.opacity = 0;
            document.getElementById("5").style.opacity = 0;
            document.getElementById("6").style.opacity = 0;
            document.getElementById("7").style.opacity = 0;
            document.getElementById("8").style.opacity = 0;
            document.getElementById("9").style.opacity = 0;
            document.getElementById("10").style.opacity = 0;
            document.getElementById("11").style.opacity = 0;
            document.getElementById("12").style.opacity = 0;
            document.getElementById("14").style.opacity = 0;
            document.getElementById("15").style.opacity = 0;
            document.getElementById("16").style.opacity = 0;
            document.getElementById("17").style.opacity = 0;
            document.getElementById("18").style.opacity = 0;
            document.getElementById("19").style.opacity = 0;
            document.getElementById("20").style.opacity = 0;
            document.getElementById("21").style.opacity = 0;
            document.getElementById("22").style.opacity = 0;
            document.getElementById("23").style.opacity = 0;
            document.getElementById("24").style.opacity = 0;
            document.getElementById("celeb").style.opacity = 1;
            document.getElementById("celeb").style.zIndex = 110;
            document.getElementById("25").style.zIndex = 200;
            
            setTimeout(function () {

                document.getElementById("25").style.opacity = 1;
                
            }, 5000);

            "use strict";

            var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

            function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

            var Progress = function () {
                function Progress() {
                    var param = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

                    _classCallCheck(this, Progress);

                    this.timestamp = null;
                    this.duration = param.duration || Progress.CONST.DURATION;
                    this.progress = 0;
                    this.delta = 0;
                    this.progress = 0;
                    this.isLoop = !!param.isLoop;

                    this.reset();
                }

                Progress.prototype.reset = function reset() {
                    this.timestamp = null;
                };

                Progress.prototype.start = function start(now) {
                    this.timestamp = now;
                };

                Progress.prototype.tick = function tick(now) {
                    if (this.timestamp) {
                        this.delta = now - this.timestamp;
                        this.progress = Math.min(this.delta / this.duration, 1);

                        if (this.progress >= 1 && this.isLoop) {
                            this.start(now);
                        }

                        return this.progress;
                    } else {
                        return 0;
                    }
                };

                _createClass(Progress, null, [{
                    key: "CONST",
                    get: function get() {
                        return {
                            DURATION: 1000
                        };
                    }
                }]);

                return Progress;
            }();

            var Confetti = function () {
                function Confetti(param) {
                    _classCallCheck(this, Confetti);

                    this.parent = param.elm || document.body;
                    this.canvas = document.createElement("canvas");
                    this.ctx = this.canvas.getContext("2d");
                    this.width = param.width || this.parent.offsetWidth;
                    this.height = param.height || this.parent.offsetHeight;
                    this.length = param.length || Confetti.CONST.PAPER_LENGTH;
                    this.yRange = param.yRange || this.height * 2;
                    this.progress = new Progress({
                        duration: param.duration,
                        isLoop: true
                    });
                    this.rotationRange = typeof param.rotationLength === "number" ? param.rotationRange : 10;
                    this.speedRange = typeof param.speedRange === "number" ? param.speedRange : 10;
                    this.sprites = [];

                    this.canvas.style.cssText = ["display: block", "position: absolute", "top: 0", "left: 0", "pointer-events: none"].join(";");

                    this.render = this.render.bind(this);

                    this.build();

                    this.parent.append(this.canvas);
                    this.progress.start(performance.now());

                    requestAnimationFrame(this.render);
                }

                Confetti.prototype.build = function build() {
                    for (var i = 0; i < this.length; ++i) {
                        var canvas = document.createElement("canvas"),
                            ctx = canvas.getContext("2d");

                        canvas.width = Confetti.CONST.SPRITE_WIDTH;
                        canvas.height = Confetti.CONST.SPRITE_HEIGHT;

                        canvas.position = {
                            initX: Math.random() * this.width,
                            initY: -canvas.height - Math.random() * this.yRange
                        };

                        canvas.rotation = this.rotationRange / 2 - Math.random() * this.rotationRange;
                        canvas.speed = this.speedRange / 2 + Math.random() * (this.speedRange / 2);

                        ctx.save();
                        ctx.fillStyle = Confetti.CONST.COLORS[Math.random() * Confetti.CONST.COLORS.length | 0];
                        ctx.fillRect(0, 0, canvas.width, canvas.height);
                        ctx.restore();

                        this.sprites.push(canvas);
                    }
                };

                Confetti.prototype.render = function render(now) {
                    var progress = this.progress.tick(now);

                    this.canvas.width = this.width;
                    this.canvas.height = this.height;

                    for (var i = 0; i < this.length; ++i) {
                        this.ctx.save();
                        this.ctx.translate(this.sprites[i].position.initX + this.sprites[i].rotation * Confetti.CONST.ROTATION_RATE * progress, this.sprites[i].position.initY + progress * (this.height + this.yRange));
                        this.ctx.rotate(this.sprites[i].rotation);
                        this.ctx.drawImage(this.sprites[i], -Confetti.CONST.SPRITE_WIDTH * Math.abs(Math.sin(progress * Math.PI * 2 * this.sprites[i].speed)) / 2, -Confetti.CONST.SPRITE_HEIGHT / 2, Confetti.CONST.SPRITE_WIDTH * Math.abs(Math.sin(progress * Math.PI * 2 * this.sprites[i].speed)), Confetti.CONST.SPRITE_HEIGHT);
                        this.ctx.restore();
                    }

                    requestAnimationFrame(this.render);
                };

                _createClass(Confetti, null, [{
                    key: "CONST",
                    get: function get() {
                        return {
                            SPRITE_WIDTH: 9,
                            SPRITE_HEIGHT: 16,
                            PAPER_LENGTH: 100,
                            DURATION: 8000,
                            ROTATION_RATE: 50,
                            COLORS: ["#EF5350", "#EC407A", "#AB47BC", "#7E57C2", "#5C6BC0", "#42A5F5", "#29B6F6", "#26C6DA", "#26A69A", "#66BB6A", "#9CCC65", "#D4E157", "#FFEE58", "#FFCA28", "#FFA726", "#FF7043", "#8D6E63", "#BDBDBD", "#78909C"]
                        };
                    }
                }]);

                return Confetti;
            }();

            (function () {
                var DURATION = 8000,
                    LENGTH = 120;

                new Confetti({
                    width: window.innerWidth,
                    height: window.innerHeight,
                    length: LENGTH,
                    duration: DURATION
                });

                setTimeout(function () {
                    new Confetti({
                        width: window.innerWidth,
                        height: window.innerHeight,
                        length: LENGTH,
                        duration: DURATION
                    });
                }, DURATION / 2);
            })();

        }
    }

    /**
     * Mouse down / Touch start event
     * 
     * @param {object} e 
     */
    mouseTouchStart(e) {
        if (this.mouseDown) return;
        this.mouseDown = true;
        const rmc = this.getRelativeMouseOrTouchCoordinates(e);
        this.findClosestSlider(rmc);
        this.redrawActiveSlider(rmc);
    }

    /**
     * Mouse move / touch move event
     * 
     * @param {object} e 
     */
    mouseTouchMove(e) {
        if (!this.mouseDown) return;
        e.preventDefault();
        const rmc = this.getRelativeMouseOrTouchCoordinates(e);
        this.redrawActiveSlider(rmc);
    }

    /**
     * Mouse move / touch move event
     * Deactivate slider
     * 
     */
    mouseTouchEnd() {
        if (!this.mouseDown) return;
        this.mouseDown = false;
        this.activeSlider = null;
    }

    /**
     * Calculate number of arc fractions and space between them
     * 
     * @param {number} circumference 
     * @param {number} arcBgFractionLength 
     * @param {number} arcBgFractionBetweenSpacing 
     * 
     * @returns {number} arcFractionSpacing
     */
    calculateSpacingBetweenArcFractions(circumference, arcBgFractionLength, arcBgFractionBetweenSpacing) {
        const numFractions = Math.floor((circumference / arcBgFractionLength) * arcBgFractionBetweenSpacing);
        const totalSpacing = circumference - numFractions * arcBgFractionLength;
        return totalSpacing / numFractions;
    }

    /**
     * Helper functiom - describe arc
     * 
     * @param {number} x 
     * @param {number} y 
     * @param {number} radius 
     * @param {number} startAngle 
     * @param {number} endAngle 
     * 
     * @returns {string} path
     */
    describeArc(x, y, radius, startAngle, endAngle) {
        let path,
            endAngleOriginal = endAngle,
            start,
            end,
            arcSweep;

        if (endAngleOriginal - startAngle === 360) {
            endAngle = 359;
        }

        start = this.polarToCartesian(x, y, radius, endAngle);
        end = this.polarToCartesian(x, y, radius, startAngle);
        arcSweep = endAngle - startAngle <= 180 ? '0' : '1';

        path = [
            'M', start.x, start.y,
            'A', radius, radius, 0, arcSweep, 0, end.x, end.y
        ];

        if (endAngleOriginal - startAngle === 360) {
            path.push('z');
        }

        return path.join(' ');
    }

    /**
     * Helper function - polar to cartesian transformation
     * 
     * @param {number} centerX 
     * @param {number} centerY 
     * @param {number} radius 
     * @param {number} angleInDegrees 
     * 
     * @returns {object} coords
     */
    polarToCartesian(centerX, centerY, radius, angleInDegrees) {
        const angleInRadians = angleInDegrees * Math.PI / 180;
        const x = centerX + (radius * Math.cos(angleInRadians));
        const y = centerY + (radius * Math.sin(angleInRadians));
        return { x, y };
    }

    /**
     * Helper function - calculate handle center
     * 
     * @param {number} angle 
     * @param {number} radius
     * 
     * @returns {object} coords 
     */
    calculateHandleCenter(angle, radius) {
        const x = this.cx + Math.cos(angle) * radius;
        const y = this.cy + Math.sin(angle) * radius;
        return { x, y };
    }

    /**
     * Get mouse/touch coordinates relative to the top and left of the container
     *  
     * @param {object} e
     * 
     * @returns {object} coords
     */
    getRelativeMouseOrTouchCoordinates(e) {
        const containerRect = document.querySelector('.slider__data').getBoundingClientRect();
        let x,
            y,
            clientPosX,
            clientPosY;

        // Touch Event triggered
        if (e instanceof TouchEvent) {
            clientPosX = e.touches[0].pageX;
            clientPosY = e.touches[0].pageY;
        }
        // Mouse Event Triggered
        else {
            clientPosX = e.clientX;
            clientPosY = e.clientY;
        }

        // Get Relative Position
        x = clientPosX - containerRect.left;
        y = clientPosY - containerRect.top;

        return { x, y };
    }

    /**
     * Calculate mouse angle in radians
     * 
     * @param {object} rmc 
     * 
     * @returns {number} angle
     */
    calculateMouseAngle(rmc) {
        const angle = Math.atan2(rmc.y - this.cy, rmc.x - this.cx);

        if (angle > - this.tau / 2 && angle < - this.tau / 4) {
            return angle + this.tau * 1.25;
        }
        else {
            return angle + this.tau * 0.25;
        }
    }

    /**
     * Helper function - transform radians to degrees
     * 
     * @param {number} angle 
     * 
     * @returns {number} angle
     */
    radiansToDegrees(angle) {
        return angle / (Math.PI / 180);
    }

    /**
     * Find closest slider to mouse pointer
     * Activate the slider
     * 
     * @param {object} rmc
     */
    findClosestSlider(rmc) {
        const mouseDistanceFromCenter = Math.hypot(rmc.x - this.cx, rmc.y - this.cy);
        const container = document.querySelector('.slider__data');
        const sliderGroups = Array.from(container.querySelectorAll('g'));

        // Get distances from client coordinates to each slider
        const distances = sliderGroups.map(slider => {
            const rad = parseInt(slider.getAttribute('rad'));
            return Math.min(Math.abs(mouseDistanceFromCenter - rad));
        });

        // Find closest slider
        const closestSliderIndex = distances.indexOf(Math.min(...distances));
        this.activeSlider = sliderGroups[closestSliderIndex];
    }
}


