/**
 * Created by Turbo on 2016/3/27.
 */

(function ( window, undefined ) {

var arr = [],
    push = arr.push,
    slice = arr.slice,
    concat = arr.concat;

//Tur_jq 构造函数
var Tur_jq = function Tur_jq ( selector ){
  return new Tur_jq.prototype.init( selector );
};

Tur_jq.fn = Tur_jq.prototype = {
    constructor:Tur_jq,
    selector:null,
    length:0,
   init:function( selector ) {
       //是空的和undefined 直接返回
       if (!selector) return this;

       // 字符串：选择器，html
       if (Tur_jq.isString(selector)) {
           if (selector.charAt(0) === '<') {
               Tur_jq.push.apply(this, Tur_jq.parseHTML(selector));
           } else {
               Tur_jq.push.apply(this, Tur_jq.select(selector));
               this.selector = selector;
           }
           return this;
       }
       //DOM 对象
       if (Tur_jq.isDOM( selector )){
           this[0] = selector;
           this.length =1;
           return this;
       }
       //Tur_jq 对象
       if( Tur_jq.isTur_jq( selector )){
           return selector;
       }
       // DOM 数组
       if( Tur_jq.isLikeArray( selector )){
           Tur_jq.push.apply( this ,selector );
           return this;
       }
       // 如果是函数的话 就是入口函数
       if( Tur_jq.isFunction( selector ) ){
           var oldFn = window.onload;
           if( typeof oldFn ==='function' ){
               window.onload = function(){
                   oldFn();
                   selector();
               };
           }else {
               window.onload = selector;
           }
       }
   },
    each:function( callback  ){
        Tur_jq.each( this ,callback );
        return this;
    }
};


Tur_jq.fn.init.prototype = Tur_jq.prototype;

//可扩展
Tur_jq.extend = Tur_jq.fn.extend = function( obj ){
  var k ;
    for( k in obj  ){
        this[k] = obj [k];
    }
};

var select =
    (function(){
//push 能力检测
        var push =[].push;
        try{
            var div = document.createElement('div');
            div.appendChild(document.createElement('div'));
            var list = div.getElementsByTagName('*');
            push.apply([],list);
        }catch(e){
            push={
                apply:function(arr,list){
                    var j=arr.length,
                        i=0;
                    while(arr[j++] = list[i++]){}
                    arr.length=j-1;
                }
            };
        }finally{
            //回收
            div = list = null;
        }
//浏览器能力检测
        var support ={};
        support.getElementsByClassName = (function(){
            var isExit = !!document.getElementsByClassName;
            if(isExit && typeof(document.getElementsByClassName)==='function'){
                var divNode = document.createElement('div'),
                    divNode2 = document.createElement('div');
                divNode2.className ='c';
                divNode.appendChild(divNode2);
                return divNode.getElementsByClassName('c')[0]===divNode2;
            }
            return false;
        })();

//  each 方法
        var each = function(arr , fn){
            var i;
            for(i=0; i<arr.length;i++){
                //    call 第一个参数将 this 指向传给他的参数
                //    回调函数返回false 用来跳出循环
                if( fn.call(arr[i],i,arr[i] )===false ){
                    //跳出循环
                    break;
                }
            }
        };

// 去空格
        var myTrim = function( str ){
            if(String.prototype.trim ){
                return str.trim();
            }else{
                return str.replace(/^\s+|\s+$/g,'');
            }
        };

//indexOf 方法
        var indexOf = function( list ,elem ){
            var i= 0,len = list.length;
            for(; i<len;i++ ){
                if( list[i]===elem ){
                    return i;
                }
            }
            return -1;
        };

//id选择器
        var getId = function( id, context ,results ){
            context = context || document;
            results = results || [];

            push.call( results ,context.getElementById(id));
            return results;
        };
//class 选择器
        var getClass = function( className , context ,results ){
            context = context || document;
            results = results || [];
            if( support.getElementsByClassName ){
                push.apply( results ,context.getElementsByClassName(className));
            }else{
                each( getTag('*',context),function(i ,v){
                    if((" "+ v.className +' ' ).indexOf(" "+className+' ')!==-1){
                        push.call( results ,v );
                    }
                });
            }
            return results;
        };
//标签选择器
        var getTag = function( tag ,context ,results ){
            context = context || document;
            results = results || [];
            push.apply( results ,context.getElementsByTagName( tag ));
            return results;
        };
//后代选择器
        var get = function( select ,context ,results ){
            results = results || [];
            context = context || document;
            var rquickRegEx = /^(?:#([\w-]+)|\.([\w-]+)|([\w-]+)|(\*))$/,
                m = rquickRegEx.exec(myTrim(select));
            if( m ){
                if( context.nodeType ){
                    context = [context];
                }
                if( typeof ( context )=='string' ){
                    context = get( context );
                }
                //?
                each( context ,function( i , v){
                    if( m[1] ){
                        results = getId( m[1] , this , results );
                    }else if( m[2] ){
                        results = getClass( m[2],this,results );
                    }else if( m[3] ){
                        results = getTag( m[3] ,this ,results );
                    }else if( m[4]  ){
                        results = getTag( m[4], this, results );
                    }
                });
            }
            return results;
        };
//对外开放的函数
        var select = function( select ,context ,results ){
            results = results ||[];
            context = context || document;
            var newSelector = select.split(',');
            each( newSelector , function( i , v ){
                var list = v.split(' ');
                var c = context;
                for( var i =0 ;i<list.length;i++ ){
                    if( list[i]=='' )continue;
                    c= get(list[i],c);
                }
                push.apply(results ,c);
            });
            return results;
        };

        return select;

    })();

var parseHTML = function( html ){
    var div = document.createElement('div'),
        arr = [],i;
    div.innerHTML = html;
    for( i=0;i< div.childNodes.length ;i++){
        arr.push( div.childNodes[i] );
    }
    return arr;
};

Tur_jq.extend({
    select : select,
    parseHTML:parseHTML
});

//基本的工具方法  each trim push
Tur_jq.extend({
   each:function(arr , fn ){
       var i,l = arr.length,
           isArray = Tur_jq.isLikeArray(arr);
       if( isArray ){
           //数组
           for( i=0 ;i<l;i++ ){
               if( fn.call( arr[i] ,i ,arr[i] )===false ){
                   break;
               }
           }
       }else{
           // 对象
           for( i in arr  ){
               if( fn.call( arr[i],i,arr[i] )===false ){
                   break;
               }
           }
       }
       return arr;
   },
    trim:function( str ){
        return str.replace( /^\s+|\s+$/g,"" );
    },
    push:push
});

// 判断类型的方法  isFunction  isString  isLikeArray  isItcast isDOM

Tur_jq.extend({
   isFunction:function(obj){
       return typeof obj === 'function';
   },
    isString:function( obj ){
        return typeof  obj ==='string';
    },
    isLikeArray: function( obj ){
        return obj && obj.length && obj.length >=0;
    },
    isTur_jq:function( obj ){
        return 'selector' in obj;
    },
    isDOM:function( obj ){
        return !!obj.nodeType;
    }
});

// 基本的DOM 操作  firstChild nextSibling nextAll
Tur_jq.extend({
   firstChild:function(dom){
       var node;
       Tur_jq.each( dom.childNodes, function(i ,v ){
          if( this.nodeType ===1 ){
              node = this;
              return false;
          }
       });
       return node;
   },
    nextSibling:function( dom ){
        var newDom = dom;
        while( newDom = newDom.nextSibling ){
            if( newDom.nodeType === 1 ){
                return newDom;
            }
        }
    },
    nextAll:function( dom ){
        var newDom = dom, arr=[];
        while( newDom = newDom.nextSibling ){
            if( newDom.nodeType ===1 ){
                arr.push( newDom );
            }
        }
        return arr;
    }
});

// 事件模块
Tur_jq.fn.extend({
   on:function( type ,callback ){
       this.each(function(){
          if( this.addEventListener ){
              this.addEventListener(type , callback);
          }else{
              this.attachEvent('on'+type,callback);
          }
       });
       return this;
   },
    off:function( type ,callback ){
        this.each( function( i ,v ){
            v.removeEventListener(type ,callback);
        });
        return this;
    }
});

// 其他事件
Tur_jq.each(
("click,mouseover,mouseout,mouseenter,mouseleave," +
    "mousemove,mousedown," +
    "mouseup,keydown,keyup" ).split(','), function ( i, v ) {

        Tur_jq.fn[v] = function (callback) {
            return this.on(v, callback);
        }
    });


// 对实例开发的hover  toggle
Tur_jq.fn.extend({
   hover:function( fn1 , fn2 ){
       return this.mouseover( fn1).mouseout(fn2);
   },
    toggle:function(){
       var args = arguments,i=0;
        return this.click( function (e){
            args[ i++ % args.length].call( this ,e );
        } )
    }
});

// css 模块

Tur_jq.fn.extend({
   css:function( cssName , cssValue ){
       //如果传进来的是{  }
       if( typeof cssName =='object' ){
           return this.each( function(){
              var k ;
               for( k in cssName ){
                   this.style[k] = cssName[k];
               }
           });
       }else if( cssValue === undefined ){
           return window.getComputedStyle( this[0] )[ cssName ];
       }else{
           return this.each( function(){
               this.style[cssName]= cssValue;
           });
       }
   },
    hasClass:function( cName  ){
     //  cname  可能是 'c1 c2 c3'
        var has = false;
        Tur_jq.each( this[0].className.split(' '),function( i , v ){
           if( v=== cName ){
               has = true;
               return false;
           }
        });
        return has;
    },
    addClass:function( cName ){
        //ok
        return this.each( function(){
            var className = this.className;
            className += " "+cName;
            this.className = Tur_jq.trim( className );
        });
    },
    removeClass:function( cName ){
        //将this 中每一个DOM 对象的ClassName 属性中符合cName 的删除掉
        return this.each( function(){
           this.className = Tur_jq.trim(
               (" "+this.className +" " ).replace(" "+cName+' '," "));
        });
    },
    toggleClass:function( cName ){
        if( this.hasClass(cName)){
            this.removeClass(cName);
        }else{
            this.addClass(cName);
        }
    }
});

    //属性操作

Tur_jq.fn.extend({
   attr:function( attName , attValue ){
       if( arguments.length ==1 ){
           return this[0][attName];
       }else{
           return this.each(function(){
              this[attName]= attValue;
           });
       }
   },
    val:function( value ){
        if( value === undefined ){
            return this[0].value;
        }else{
            return this.each( function(){
                this.value = value;
            });
        }
    }
});

    //内容处理模块
Tur_jq.extend({
   getInnerText:function( dom ){
       var list =[];
       if( dom.innerText !==undefined ){
           return dom.innerText;
       }else{
           getTextNode( dom, list );
           return join('');
       }
       function getTextNode ( dom ,arr  ){
            //将dom 里面的所有的文本节点放到arr 中
           var i, l= dom.childNodes.length,node;
           for( i=0 ;i<l;i++ ){
               node = dom.childNodes[i];
               //文本节点
               if( node.nodeType ===3 ){
                   arr.push( node.nodeValue );
               }else{
                   getTextNode(node ,arr );
               }
           }
       }
   },
    setInnerText:function( dom ,str ){
        if( 'innerText' in dom ){
            dom.innerText = str;
        }else{
            dom.innerHTML ='';
            dom.appendChild(document.createTextNode( str ));
        }
    }

});

//html  text

Tur_jq.fn.extend({
   html:function(html ){
       if( html === undefined ){
           // 返回 0 元素的innerHTML
           return this[0].innerHTML;
       }else{
           return this.each( function(){
               this.innerHTML = html;
           });
       }
   },
    text:function(text){
        if( text ===undefined ){
            return Tur_jq.getInnerText( this[0] );
        }else{
            return this.each(function(){
                Tur_jq.setInnerText(this,text);
            });
        }
    }
});

    // 对外公开
    window.T = window.Tur_jq = Tur_jq;

})( window );