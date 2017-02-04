
// Skybox texture from: https://github.com/mrdoob/three.js/tree/master/examples/textures/cube/skybox

const THREE = require('three'); // older modules are imported like this. You shouldn't have to worry about this much
import Framework from './framework'

// three locations on the feather and interping between them
// tip, mid, and base (connects to body)

/*******************************/
/***** POSITION ATTRIBUTES *****/
/*******************************/

var numPositions = 30;

var distOffset = .15; // starts out at .15 bc distrib level 1 but changed in gui
var heightOffset = .05; // starts out at .05 bc distrib level 1 but changed in gui
var rotateForOverlapPos = 10 * 2 * Math.PI / 180;

var time = 0;

// make so numbers across each level restart (ie on level 2 if only 
//  2 levels the numbers go back to zero to get x position right)
function iValBasedOnLevels(i) {
    var d = attributes.distrib;
    var half = numPositions/2.0;
    var third = numPositions/3.0;
    var twoThirds = 2*third;
    if (d == 1) {
        return i;
    } else if (d == 2) {
        if (i < half) {
            return i;
        } 
        return half - (numPositions - i);
    } else if (d == 3) {
        if (i < third) {
            return i;
        } else if (i < twoThirds) {
            return i - third;
        } 
        return i - twoThirds;
    }
    console.log("UNEXPECTED DISTRIBUTION: " + attributes.distrib);
    return -1;
}

function levelFromDistrib(i) {
    var d = attributes.distrib;
    var half = numPositions/2.0;
    var third = numPositions/3.0;
    var twoThirds = 2*third;
    if (d == 1) {
        return 1;
    } else if (d == 2) {
        if (i < half) {
            return 1;
        } 
        return 2;
    } else if (d == 3) {
        if (i < third) {
            return 1;
        } else if (i < twoThirds) {
            return 2;
        } 
        return 3;
    }
    console.log("UNEXPECTED DISTRIBUTION: " + attributes.distrib);
    return -1;
}

/****************************/
/***** X POS OF FEATHER *****/
/****************************/

// calculating full position of feather's x location in space
function calcX (itemNum) {
    var w = attributes.wingCurvature;
    var a;
    var b;
    if (w == 1) {
        return calcBaseX(itemNum);
    } else if (w == 2) {
        a = 1.0;
        b = 2.0;
    } else if (w == 3) {
        a = 1.0;
        b = 3.0;
    } else {
        console.log("UNEXPECTED DISTRIBUTION: " + w);
        return -1;
    }
    var x = iValBasedOnLevels(itemNum) / (numPositions / attributes.distrib);
    if (x == 0) {
        x = .01;
    }

    return calcBaseX(itemNum) - pcurve(x, a, b);
}
// calculating feather's location on wing itself [un modeled]
function calcBaseX(itemNum) {
    var d = attributes.distrib;
    var base = 0.0;

    var level1 = base;
    var level2 = distOffset + base;
    var level3 = distOffset*2 + base;

    var onLevel = levelFromDistrib(itemNum);

    if (onLevel == 1) {
        return level1;
    } else if (onLevel == 2) {
        return level2;
    } else if (onLevel == 3) {
        return level3;
    }
    console.log("UNEXPECTED DISTRIBUTION: " + attributes.distrib);
    return -1;
}
/***** end: X POS OF FEATHER *****/

/****************************/
/***** Y POS OF FEATHER *****/
/****************************/

// calculating full position of feather's y location in space
function calcY (itemNum) {
    var sin;
    var m = attributes.motion;
    sin = sinValY1(itemNum)
    return calcBaseY(itemNum) + sin;
}
// calculating feather's location on wing itself [un modeled]
function calcBaseY(itemNum) {
    var base = 0.0;
    var level1 = base;
    var level2 = base - heightOffset;
    var level3 = base - heightOffset*2;

    var onLevel = levelFromDistrib(itemNum);

    if (onLevel == 1) {
        return level1;
    } else if (onLevel == 2) {
        return level2;
    } else if (onLevel == 3) {
        return level3;
    }
    console.log("UNEXPECTED DISTRIBUTION: " + attributes.distrib);
    return -1;
}

function sinValY(itemNum, inVal1, inVal2) {
    var i = iValBasedOnLevels(itemNum);
    var p = 2 * Math.PI / 180;
    var speed = 250 * attributes.wingSpeed;
    var f = inVal1 * Math.abs(Math.sin(time / speed)); 
    var amp = inVal2;

    var stepLen = numPositions / attributes.distrib;
    var t = i / stepLen;
    if (t == 0) {
        t = 0.01;
    }

    t = 1 - t;

    var ret = amp * (Math.sin(i*f*p + t));

    var g = 0.2;
    var stepLen = numPositions / attributes.distrib
    var gVal = gain(g, t);

    gVal = 1.0;

    return gVal*ret;
}
// calculating pos based on time for feather in wing
function sinValY1(itemNum) {
   return sinValY(itemNum, 1.5 * attributes.motion, 5.0);
}
// function sinValY2(itemNum) {
//     return sinValY(itemNum, 1.0, 6.0);
// }
// function sinValY3(itemNum) {
//     return sinValY(itemNum, 0.5, 7.0);
// }
/***** end: Y POS OF FEATHER *****/


/****************************/
/***** Z POS OF FEATHER *****/
/****************************/

// calculating full position of feather's z location in space
function calcZ(itemNum) {
    return calcBaseZ(itemNum);
}
// calculating feather's location on wing itself [un modeled]
function calcBaseZ(itemNum) {
    var base1 = 0.0;
    var base2 = base1 + 0.05; // so layers arent put directly on top of one another
    var level1 = distOffset*itemNum + base1;
    var level2 = distOffset*(numPositions/2 - (numPositions - itemNum)) + base2;
    var level3_2 = distOffset*(itemNum-numPositions/3) + base2;
    var level3_3 = distOffset*(itemNum-2*numPositions/3) + base1;

    var onLevel = levelFromDistrib(itemNum);

    var d = attributes.distrib;

    if (onLevel == 1 && d != 3) {
        return level1;
    } else if (onLevel == 2 && d != 3) {
        return level2;
    } else if (d == 3) {
        if (onLevel == 1) {
            return level1;
        } else if (onLevel == 2) {
            return level3_2;
        } 
        return level3_3;
    }
    console.log("UNEXPECTED DISTRIBUTION: " + attributes.distrib);
    return -1;   
}
/***** end: Z POS OF FEATHER *****/

function setScaleFeather(f, i) {
    var s = attributes.size;
    var scaleOff1 = 1.2*s;
    var scaleOff2 = 1.2*s;
    var scaleOff3 = 1.4*s;
    if (attributes.distrib == 1) {
        f.scale.set(s, s, s);
    } else if (attributes.distrib == 2) {
        if (i < numPositions/2) {
            f.scale.set(s, s, s);
        } else {
            f.scale.set(scaleOff1, scaleOff1, scaleOff1);
        }
    } else if (attributes.distrib == 3) {
        if (i < numPositions/3) {
            f.scale.set(s, s, s);
        } else if (i < 2*numPositions/3) {
            f.scale.set(scaleOff2, scaleOff2, scaleOff2);
        } else {
            f.scale.set(scaleOff3, scaleOff3, scaleOff3);
        }
    }
}

function rotationForSpread(i) {
    var rot = -attributes.orientation * 2 * Math.PI / 180; 
    var g = 0.2;
    var stepLen = numPositions / attributes.distrib
    var t = iValBasedOnLevels(i) / stepLen;
    if (t == 0) {
        t = 0.01;
    }
    var gVal = gain(g, t);

    return gVal*rot;
}

/***** end: POSITION ATTRIBUTES *****/

/********************************/
/***** COLOR AND ATTRIBUTES *****/
/********************************/

var allColorsHex = [
    0xaaaaaa, 0x663300, 0xff8000, 0xff0000, 0xff007f, 0xff00ff, 0x7f00ff, 0x0000ff, 0x0080ff, 0x00ffff, 
    0x00ff00, 0xffff00, 0xaaaaaa, 0x808080, 0x000000
];

var allColors = [];

// Brown, Orange, Red, Pink, Magenta, Purple, DarkBlue, Blue, LightBlue, Green, Yellow, White, Gray, Black

var attributes = {
    color: 0, // color of feathers
    size: 1, // size of feathers
    distrib: 1, // number of layers
    orientation: 45,
    wingSpeed: 3,
    wingCurvature: 1, 
    motion: 1,
    windSpeed: 0
}
/***** end: COLOR AND ATTRIBUTES *****/

/**************************/
/***** STEP FUNCTIONS *****/
/**************************/

function smoothStep(edge0, edge1, x) {
    x = Math.clamp((x - edge0)/(edge1-edge0), 0.0, 1.0);
    return x*x*(3-2.0*x);
}

function smootherStep(edge0, edge1, x) {
    x = Math.clamp((x-edge0)/(edge1-edge0), 0.0, 1.0);
    return x*x*x*(x*(x*6 - 15) + 10);
}

function bias(b, t) {
    return Math.pow(t, Math.log(b) / Math.log(0.5));
}

function gain(g, t) {
    if (t < 0.5) {
        return bias(1-g, 2*t) / 2.0;
    } else {
        return 1 - bias(1-g, 2-2*t) / 2.0;
    }
}

function pcurve(x, a, b) {
    var k = Math.pow(a+b, a+b) / (Math.pow(a,a)*Math.pow(b,b));
    return (k * Math.pow(x, a) * Math.pow(1.0-x, b));
}

function impulse(k, x) {
    var h = k*x;
    return h*Math.exp(1.0-h);
}
/***** end: STEP FUNCTIONS *****/


/******************************/
/***** BUILDING THE SCENE *****/
/******************************/

function destroyFeathers(framework) {
    var j = 0;
    while (j<numPositions) {
        var feather = framework.scene.getObjectByName("feather_"+j); 
        if (feather !== undefined) {  
            framework.scene.remove(feather);

            // destroying additional parts so no remnant features
            // feather.dispose(); 
            // feather.geometry.dispose();
            // feather.material.dispose();
            // feather.texture.dispose();
        }
        j++;
    }
}

function addFeathers(framework) {
    var i = 0;
    var objLoader = new THREE.OBJLoader();
    objLoader.load('geo/feather.obj', function(obj) {
        while (i < numPositions) {
            // LOOK: This function runs after the obj has finished loading
            var featherGeo = obj.children[0].geometry;
            
            var featherMesh = new THREE.Mesh(featherGeo, allColors[attributes.color]);

            // setting up feather attributes
            featherMesh.name = "feather_"+i;
            framework.scene.add(featherMesh);

            // rotation for overlap
            featherMesh.rotateX(rotateForOverlapPos);
            // rotation for spread of feather tips
            var rotForSpread = rotationForSpread(i);
            featherMesh.rotateY(rotForSpread);

            i++;
        }
    });
}

// called after the scene loads
function onLoad(framework) {
    var scene = framework.scene;
    var camera = framework.camera;
    var renderer = framework.renderer;
    var gui = framework.gui;
    var stats = framework.stats;

    // Set light
    var directionalLight = new THREE.DirectionalLight( 0xffffff, 1 );
    directionalLight.color.setHSL(0.1, 1, 0.95);
    directionalLight.position.set(1, 3, 2);
    directionalLight.position.multiplyScalar(10);

    // set skybox
    var loader = new THREE.CubeTextureLoader();
    var urlPrefix = 'images/skymap/';

    var skymap = new THREE.CubeTextureLoader().load([
        urlPrefix + 'px.jpg', urlPrefix + 'nx.jpg',
        urlPrefix + 'py.jpg', urlPrefix + 'ny.jpg',
        urlPrefix + 'pz.jpg', urlPrefix + 'nz.jpg'
    ] );

    scene.background = skymap;

    // set camera position
    camera.position.set(0, 1, 5);
    camera.lookAt(new THREE.Vector3(0,0,0));

    // scene.add(lambertCube);
    scene.add(directionalLight);

    /*************************************/
    /****** SET UP COLOR ELEMENTS ********/
    /*************************************/
    
    var colorLoc = 0;
    while (colorLoc < numPositions) {
        allColors.push(new THREE.MeshLambertMaterial({ color: allColorsHex[colorLoc], side: THREE.DoubleSide }));
        colorLoc ++;
    }

    /*************************************/
    /****** ADDING FEATHERS TO SCENE *****/
    /*************************************/

    // load a simple obj mesh
    addFeathers(framework);

    // set camera position
    camera.position.set(0, 1, 5);
    camera.lookAt(new THREE.Vector3(0,0,0));

    // scene.add(lambertCube);
    scene.add(directionalLight);

    /*************************/  
    /****** GUI ELEMENTS *****/
    /*************************/

    // CHANGING FOV
    // edit params and listen to changes like this
    // more information here: https://workshop.chromeexperiments.com/examples/gui/#1--Basic-Usage
    gui.add(camera, 'fov', 0, 180).onChange(function(newVal) {
        camera.updateProjectionMatrix();
    });


    // CHANGING COLOR
    gui.add(attributes, 'color', 0, 13).step(1).listen().onChange(function(newVal) {
        destroyFeathers(framework);
        addFeathers(framework);
    });

    // CHANGING SIZE
    gui.add(attributes, 'size', 1, 4).step(1).listen().onChange(function(newVal) {
        destroyFeathers(framework);
        addFeathers(framework);
    });

    // CHANGING SIZE
    gui.add(attributes, 'distrib', 1, 3).step(1).listen().onChange(function(newVal) {
        destroyFeathers(framework);

        var d = attributes.distrib;
        if (d == 1) {
            numPositions = 30;
            distOffset = .15 * d;
            heightOffset = .05 * d;
        } else if (d == 2) {
            numPositions = 60;
            distOffset = .15 * d/2.0;
            heightOffset = .05 * d/1.5;
        } else if (d == 3) {
            numPositions = 90;
            distOffset = .15 * d/2.0;
            heightOffset = .05 * d/1.5;
        } else {
            console.log("gui: UNEXPECTED DISTRIBUTION: " + d);
        }

        addFeathers(framework);
    });

    // CHANGING SIZE
    gui.add(attributes, 'orientation', 0, 45).step(1).listen().onChange(function(newVal) {
        destroyFeathers(framework);
        addFeathers(framework);
    });

    // CHANGING WINGSPEED
    gui.add(attributes, 'wingSpeed', 1, 3).step(1).listen().onChange(function(newVal) {
        // destroyFeathers(framework);
        // addFeathers(framework);
    });

    // CHANGING WINGCURVATURE
    gui.add(attributes, 'wingCurvature', 1, 3).step(1).listen().onChange(function(newVal) {
        destroyFeathers(framework);
        addFeathers(framework);
    });

    // CHANGING WINGMOTION
    gui.add(attributes, 'motion', 0.1, 1).step(.1).listen().onChange(function(newVal) {
        // destroyFeathers(framework);
        // addFeathers(framework);
    });

    // WINDSPEED
    gui.add(attributes, 'windSpeed', 0, 3).step(1).listen().onChange(function(newVal) {
        destroyFeathers(framework);
        addFeathers(framework);
    });
}
/***** end: BUILD THE SCENE *****/


// called on frame updates
function onUpdate(framework) {
    // console.log("inside onUpdate");
    // var feather1 = framework.scene.getObjectByName("feather_0");    
    // if (feather1 !== undefined) {
    //     // Simply flap wing
    //     var date = new Date();
    //     feather1.rotateZ(Math.sin(date.getTime() / 100) * 2 * Math.PI / 180);        
    // }

    // var feather2 = framework.scene.getObjectByName("feather_1");    
    // if (feather2 !== undefined) {
    //     // Simply flap wing
    //     var date = new Date();
    //     feather2.rotateZ(Math.cos(date.getTime() / 100) * 2 * Math.PI / 180);        
    // }

    time =  (new Date()).getTime();
    
    var i = 0;
    while (i < numPositions) {
        var feather = framework.scene.getObjectByName("feather_"+i); 
        if (feather !== undefined) {  
            feather.position.set(calcX(i), calcY(i), calcZ(i));
            setScaleFeather(feather, i);
            if (attributes.windSpeed > 0) {
                var timeMod = 20;
                var opptimeMod = 15;
                if (attributes.windSpeed == 1) {
                    // same values as initializec
                } else if (attributes.windSpeed == 2) {
                    timeMod = 15;
                    opptimeMod = 10;
                } else if (attributes.windSpeed == 3) {
                    timeMod = 10;
                    opptimeMod = 5;
                } else {
                    console.log("UNKNOWN WINDSPEED:" + attributes.windSpeed);
                }
                
                
                if (time % timeMod == 0) {
                    var rot = Math.ceil(Math.random() * attributes.windSpeed * 5);
                    var neg = 1.0;
                    if (Math.random() > .5) {
                        neg = -1.0;
                    }
                    var rotVal = neg * Math.random() * Math.PI / 180;
                    feather.rotateZ(rotVal);
                } else if (time % opptimeMod == 0) {
                    // var axis = new THREE.Vector3(1, 0, 0);
                    // var vector = new THREE.Vector3(100, 60, 20);
                    // feather.quaternion.setFromUnitVectors(axis, vector.clone().normalize());
                    feather.rotation.z = - feather.rotation.z;
                }
            }

            // var date = new Date();
            // feather.rotateZ(Math.cos(date.getTime() / 100) * 2 * Math.PI / 180 * i);  
        } 

        i++;
    }
}

// when the scene is done initializing, it will call onLoad, then on frame updates, call onUpdate
Framework.init(onLoad, onUpdate);
