var imageLoader = document.getElementById('imageLoader');
var dropzone = document.getElementById('dropzone');
var dropzoneText = document.getElementById('dropzoneText');
var textWatermark = document.getElementById('textWatermark');
var wmOpacity = document.getElementById('wmOpacity');
var wmSize = document.getElementById('wmSize');
var aiProtection = document.getElementById('aiProtection');
var canvas = document.getElementById('imageCanvas');
var ctx = canvas.getContext('2d');
var downloadBtn = document.getElementById('downloadBtn');
var placeholderText = document.getElementById('placeholderText');
var opacityVal = document.getElementById('opacityVal');
var sizeVal = document.getElementById('sizeVal');
var originalImage = null;

['dragenter', 'dragover'].forEach(function(name) {
    dropzone.addEventListener(name, function() { dropzone.classList.add('dragover'); }, false);
});
['dragleave', 'drop'].forEach(function(name) {
    dropzone.addEventListener(name, function() { dropzone.classList.remove('dragover'); }, false);
});

imageLoader.addEventListener('change', handleImage, false);
textWatermark.addEventListener('input', updateWatermark);

wmOpacity.addEventListener('input', function(e) {
    opacityVal.innerText = Math.round(e.target.value * 100) + '%';
    updateWatermark();
});

wmSize.addEventListener('input', function(e) {
    sizeVal.innerText = e.target.value + 'px';
    updateWatermark();
});

aiProtection.addEventListener('change', updateWatermark);

function handleImage(e) {
    if (!e.target.files || !e.target.files[0]) return;
    var file = e.target.files[0];
    dropzoneText.innerHTML = 'Выбран файл: <strong>' + file.name + '</strong>';
    var reader = new FileReader();
    reader.onload = function(event) {
        originalImage = new Image();
        originalImage.onload = function() {
            placeholderText.style.display = 'none';
            canvas.style.display = 'block';
            downloadBtn.disabled = false;
            updateWatermark();
        };
        originalImage.src = event.target.result;
    };
    reader.readAsDataURL(file);
}

function drawWavyText(text, x, y, size, opacity) {
    ctx.save();
    ctx.font = 'bold ' + size + 'px sans-serif';
    ctx.fillStyle = 'rgba(100, 110, 130, ' + opacity + ')';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    var currentX = x - ctx.measureText(text).width / 2;
    var amplitude = size * 0.22;
    var frequency = 0.18;
    for (var i = 0; i < text.length; i++) {
        var letter = text[i];
        var letterWidth = ctx.measureText(letter).width;
        var offsetY = Math.sin(i * frequency) * amplitude;
        ctx.fillText(letter, currentX, y + offsetY);
        currentX += letterWidth;
    }
    ctx.restore();
}

function updateWatermark() {
    if (!originalImage) return;
    canvas.width = originalImage.width;
    canvas.height = originalImage.height;
    ctx.drawImage(originalImage, 0, 0);
    var size = parseInt(wmSize.value);
    var opacity = parseFloat(wmOpacity.value);
    var useAiProtection = aiProtection.checked;
    var text = textWatermark.value || "ЗАЩИЩЕНО";
    ctx.font = 'bold ' + size + 'px sans-serif';
    var textWidth = ctx.measureText(text).width;
    var stepX = textWidth + 140;
    var stepY = size * 5.5;

    if (useAiProtection) {
        ctx.save();
        ctx.strokeStyle = 'rgba(239, 68, 68, ' + (opacity * 0.35) + ')';
        ctx.lineWidth = Math.max(1, size * 0.04);
        for (var y = -canvas.height; y < canvas.height * 2; y += stepY) {
            ctx.beginPath(); ctx.moveTo(-canvas.width, y); ctx.lineTo(canvas.width * 2, y + canvas.height); ctx.stroke();
        }
        ctx.restore();
    }

    ctx.save();
    for (var x = -canvas.width; x < canvas.width * 2; x += stepX) {
        for (var y = -canvas.height; y < canvas.height * 2; y += stepY) {
            ctx.save(); ctx.translate(x, y); ctx.rotate(-32 * Math.PI / 180);
            if (useAiProtection) { drawWavyText(text, 0, 0, size, opacity); }
            else {
                ctx.font = 'bold ' + size + 'px sans-serif'; ctx.fillStyle = 'rgba(0, 0, 0, ' + opacity + ')';
                ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(text, 0, 0);
            }
            ctx.restore();
        }
    }
    ctx.restore();

    if (useAiProtection) {
        ctx.save();
        var numNoisePixels = (canvas.width * canvas.height) * 0.006;
        for (var i = 0; i < numNoisePixels; i++) {
            var noiseX = Math.random() * canvas.width;
            var noiseY = Math.random() * canvas.height;
            var noiseSize = Math.random() * 2 + 1;
            var gray = Math.floor(Math.random() * 140 + 60);
            ctx.fillStyle = 'rgba(' + gray + ', ' + gray + ', ' + (gray + 15) + ', ' + (opacity * 1.4) + ')';
            ctx.fillRect(noiseX, noiseY, noiseSize, noiseSize);
        }
        ctx.restore();
    }
}

downloadBtn.addEventListener('click', function() {
    if (!originalImage) return;
    var link = document.createElement('a');
    link.download = 'protected_document.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
});
