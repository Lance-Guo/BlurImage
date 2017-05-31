/**
 * Created by guoruiyang on 2017/5/30.
 */
window.onload = function() {
    var img = document.getElementById('imgSource');
    canvas = document.getElementById('canvas');
    width = img.width;
    height = img.height;

    canvas.width = width;
    canvas.height = height;

    var context = canvas.getContext('2d');
    context.drawImage(img, 0, 0);

    var canvasData = context.getImageData(0, 0, canvas.width, canvas.height);
    console.log(canvasData);

    // 模糊图像
   var startTime = +new Date();
    var tempData = gaussBlur(canvasData, 20);
    // var tempData = gaussBlur(canvasData, 20);
    context.putImageData(tempData, 0, 0);
    var endTime = +new Date();
    console.log('模糊图像一共经历了：' + (endTime - startTime) + 'ms');

    // 转化为灰度图像
    /*var startTime1 = +new Date();
    var tempData1 = grayScale(canvasData);
    context.putImageData(tempData1, 0, 0);
    var endTime1 = +new Date();
    console.log('转化为灰度图像经历了：' + (endTime1 - startTime1) + 'ms');*/
}
/**
 * 二重循环
 * @param imgData image.data
 * @param radius 高斯半径
 * @param sigma
 * @returns {*}
 */
function gaussBlur(imgData, radius, sigma) {
    var pixes = imgData.data;
    width = imgData.width;
    height = imgData.height;

    radius = radius || 5;
    sigma = sigma || radius / 3;

    var gaussEdge =radius * 2 + 1;

    var gaussMatrix = [],
    gaussSum = 0,
    a = 1 / (2 * sigma * sigma * Math.PI),
    b = -a * Math.PI;

    for(let i = -radius; i <= radius; i++) {
        for(let j = -radius; j <= radius; j++) {
            var gxy = a * Math.exp((i * i + j * j) * b);
            gaussMatrix.push(gxy);
            gaussSum += gxy;
        }
    }
    // var gaussNum = (radius + 1) * (radius + 1);
    for (let i = 0; i < gaussMatrix.length; i++) {
        gaussMatrix[i] = gaussMatrix[i] / gaussSum;
    }

    //循环计算整个图像每个像素高斯处理之后的值
    for(let x = 0; x < width; x++) {
        for(let y = 0; y < height; y++) {
            var r = 0, g = 0, b = 0;
            // 计算每个点的高斯处理之后的值
            for(let i = -radius; i <= radius; i++) {
                var m = handleEdge(i, x, width);
                for(let j = -radius; j <= radius; j++) {
                    var mm = handleEdge(j, y, height);

                    var currentPixId = (mm * width + m) * 4;

                    var jj = j + radius;
                    var ii = i + radius;
                    r += pixes[currentPixId] * gaussMatrix[jj * gaussEdge + ii];
                    g += pixes[currentPixId + 1] * gaussMatrix[jj * gaussEdge + ii];
                    b += pixes[currentPixId + 2] * gaussMatrix[jj * gaussEdge + ii];
                }
            }
            var pixId = (y * width + x) * 4;
            pixes[pixId] = ~~r;
            pixes[pixId + 1] = ~~g;
            pixes[pixId + 2] = ~~b;
        }
    }
    imgData.data = pixes;
    return imgData;
}
function handleEdge(i, x, w) {
    var m = x + i;
    if(m < 0) {
        m = -m;
    } else if(m >= w) {
        m = w + i - x;
    }
    return m;
}

function gaussBlur1(imgData, radius, sigma) {
    var pixes = imgData.data;
    width = imgData.width;
    height = imgData.height;

    radius = radius || 5;
    sigma = sigma || radius / 3;

    var gaussEdge =radius * 2 + 1;

    var gaussMatrix = [],
        gaussSum = 0,
        a = 1 / (Math.sqrt(2 * Math.PI) * sigma),
        b = -1 / (2 * sigma * sigma);

    for(let x = -radius; x <= radius; x++) {
        g = a * Math.exp(b * x * x);
        gaussMatrix.push(g);
        gaussSum += g;
    }

    for(let i = 0; i < gaussMatrix.length; i++) {
        gaussMatrix[i] /= gaussSum;
    }
    console.log(gaussMatrix.length);
    // x 方向的一维运算
    for(let y = 0; y < height; y++) {
        for(let x = 0; x < width; x++) {
            let r = g = b = 0;
            gaussSum = 0;
            for(let j = -radius; j <= radius; j++) {
                let k = x + j;
                if(k >= 0 && k < width) {
                    let i = (y * width + k) * 4;
                    r += pixes[i] * gaussMatrix[j + radius];
                    g += pixes[i + 1] * gaussMatrix[j + radius];
                    b += pixes[i + 2] * gaussMatrix[j + radius];

                    gaussSum += gaussMatrix[j + radius];
                }
            }
            let i = (y * width + x) * 4;
            pixes[i] = r / gaussSum;
            pixes[i + 1] = g / gaussSum;
            pixes[i + 2] = b / gaussSum;
        }
    }
    // y 方向上的一维运算
    for(x = 0; x < width; x++) {
        for( y = 0; y < height; y++) {
            let r = g = b = 0;
            gaussSum = 0;
            for(j = -radius; j <= radius; j++) {
                let k = y + j;
                if(k >= 0 && k < height) {
                    let i = (k * width + x) * 4;
                    r += pixes[i] * gaussMatrix[j + radius];
                    g += pixes[i + 1] * gaussMatrix[j + radius];
                    b += pixes[i + 2] * gaussMatrix[j + radius];

                    gaussSum += gaussMatrix[j + radius];
                }
            }
            let i = (y * width + x) * 4;
            pixes[i] = r / gaussSum;
            pixes[i + 1] = g / gaussSum;
            pixes[i + 2] = b / gaussSum;
        }
    }
    imgData.data = pixes;
    return imgData;
}
function grayScale(imgData) {
    var pixes = imgData.data;
    width = imgData.width;
    height = imgData.height;

    for(let i = 0; i < width; i++) {
        for(let j = 0; j < height; j++) {
            let k = (j * width + i) * 4;
            pixes[k] = pixes[k+1] = pixes[k+2] = pixes[k]*0.2928 + pixes[k+1] + pixes[k+2] * 0.1140;
        }
    }
    imgData.data = pixes;
    return imgData;
}
