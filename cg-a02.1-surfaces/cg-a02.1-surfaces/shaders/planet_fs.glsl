precision mediump float;


// uniform lights (we only have the sun)




// uniform material constants k_a, k_d, k_s, alpha

//uniform sampler2D textures;
uniform sampler2D daytimeTexture;
uniform sampler2D nighttimeTexture;
uniform sampler2D cloudedTexture;

// three js only supports int no bool
// if you want a boolean value in the shader, use int
uniform int daytimeTextureBool;
uniform int nighttimeTextureBool;
uniform int cloudedTextureBool;

// data from the vertex shader


void main() {


    // get color from different textures
    //vec3 color = texture2D(textureUniform, texCoord).rgb;
   
    // normalize normal after projection
    
    // do we use a perspective or an orthogonal projection matrix?
    //bool usePerspective = projectionMatrix[2][3] != 0.0;
    // for perspective mode, the viewing direction (in eye coords) points
    // from the vertex to the origin (0,0,0) --> use -ecPosition as direction.
    // for orthogonal mode, the viewing direction is simply (0,0,1)
    
    // calculate color using phong illumination
    // depending on GUI checkbox:
    // color from night texture and clouds are added to ambient term (instead of ambient material k_a)
    // color from day texture are added to diffuse term (instead of diffuse material k_d)

    // Note: the texture value might have to get rescaled (gamma corrected)
    //       e.g. color = pow(color, vec3(0.6))*2.0;
    
    // vector from light to current point
//    vec3 l = normalize(directionalLightDirection[0]);

    
    // diffuse contribution
//    vec3 diffuseCoeff = (daytimeTextureBool == 1 )? dayCol : diffuseMaterial;
    // clouds at day?
//    if(cloudedTextureBool == 1) {
        //diffuseCoeff = ...
//    }

    // ...

    // final diffuse term for daytime
    //vec3 diffuse =  diffuseCoeff * directionalLightColor[0] * ndotl;

    // ambient part contains lights; modify depending on time of day
    // when ndotl == 1.0 the ambient term should be zero

    vec3 color = texture2D(daytimeTexture, vUv).rgb; //replace with ambient + diffuse + specular;

    gl_FragColor = vec4(color, 1.0);


}