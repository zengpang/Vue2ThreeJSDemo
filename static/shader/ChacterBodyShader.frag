
#include <common>

uniform vec3 diffuse;
uniform float opacity;
uniform mat4 modelMatrix;
uniform vec3 color;
uniform vec3 lightPosition;
uniform vec3 _mainColor;
uniform sampler2D _mainTex;
uniform sampler2D _normalTex;
uniform vec2 tilling;
uniform  float _roughness;
uniform  float _roughnessContrast;
uniform  float _roughnessInit;
uniform  float _roughnessMin;
uniform  float _roughnessMax;
varying vec3 objectPos;
varying vec3 vNormal;
varying vec2 vUv;

vec3 ACETompping(vec3 x)
{
    float a=2.51;
    float b=.03;
    float c=2.43;
    float d=.59;
    float e=.14;
    return saturate((x*(a*x+b))/(x*(c*x+d)+e));
}
vec4 lerp(vec4 a,vec4 b,vec4 w)
{
    return a+w*(b-a);
    
}
float lerpFloat(float a,float b,float w)
{
    return a+w*(b-a);
    
}
mat3 cotangent_frame(vec3 N,vec3 p,vec2 uv)
{
   
    vec3 dp1=dFdx(p);
    vec3 dp2=dFdy(p);
    vec2 duv1=dFdx(uv);
    vec2 duv2=dFdy(uv);
    
    
    vec3 dp2perp=cross(dp2,N);
    vec3 dp1perp=cross(N,dp1);
    vec3 T=dp2perp*duv1.x+dp1perp*duv2.x;
    vec3 B=dp2perp*duv1.y+dp1perp*duv2.y;
    
   
    float invmax=inversesqrt(max(dot(T,T),dot(B,B)));
    return mat3(T*invmax,B*invmax,N);
}
vec3 ComputeNormal(vec3 nornal,vec3 viewDir,vec2 uv,sampler2D normalMap)
{
 
    vec3 map=texture2D(normalMap,uv).xyz;
    
    map=map*255./127.-128./127.;
    
    mat3 TBN=cotangent_frame(nornal,-viewDir,uv);
    return normalize(TBN*map);
    return(texture2D(normalMap,vUv).rgb-.5)*2.;
}
void main() {
	
    vec3 worldNormal = normalize( vec3( modelMatrix * vec4( vNormal, 0.0 ) ) );
     vec3 worldPosition=(modelMatrix*vec4(objectPos,1.0)).xyz;//获取世界坐标
	
     vec3 vDir=normalize(cameraPosition-worldPosition);
    vec3 nDir=ComputeNormal(worldNormal,vDir,vUv*tilling,_normalTex);
    vec3 lDir = normalize( lightPosition - worldPosition );
    //向量操作
    
    vec3 rvDir=reflect(-vDir,nDir);
    float NdotV=dot(nDir,vDir);
    float NdotL=dot(nDir,lDir);
    //贴图操作
 
    
    vec3 mainTex=texture2D(_mainTex,vUv).xyz;
    vec3 roughnessTex=vec3(1.0,1.0,1.0);
    vec3 _roughnessContrasts=vec3(_roughnessContrast,_roughnessContrast,_roughnessContrast);
    
    //粗糙度
    float finalRoughness=saturate(pow(roughnessTex,_roughnessContrasts)*_roughnessInit).x;
    finalRoughness=lerpFloat(_roughnessMin,_roughnessMax,finalRoughness);
    finalRoughness=finalRoughness*(1.7-.7*finalRoughness);
    finalRoughness=finalRoughness*6.;
    
    //漫反射模型(兰伯特)
    vec3 lambert=vec3(max(0.0,NdotL),max(0.0,NdotL),max(0.0,NdotL));

    
    //最终颜色
    vec3 finalColor=(lambert.xyz*_mainColor);
    vec3 finalColor_liner=pow(finalColor,vec3(2.2,2.2,2.2));
    finalColor=ACETompping(finalColor_liner);
    vec3 finalColor_gamma=pow(finalColor,vec3(1./2.2,1./2.2,1./2.2));
    
    gl_FragColor=vec4(finalColor_gamma,1);
	
}