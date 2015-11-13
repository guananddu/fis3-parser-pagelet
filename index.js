const fs = require( 'fs' );
const path = require( 'path' );

const CURR_PROJECT_DIR = process.cwd();

// 获取指令标签的正则
const pattern = /\[\[\s*include\s+(['"])([^'"\[\]]+)\1[\s\n]+(with.*)?\]\]/g;

// var scriptTag = '<!-- PAGELET_SCRIPT -->';
var scriptTag = '</body>';

/**
 * 返回less文件的实际内容
 * @param realpath
 * @param propath
 * @returns {string}
 */
function getLess( realpath, propath ) {
    return fs.existsSync( realpath )
        ? '<link rel="stylesheet" href="' + propath + '?__inline">'
        : '';
}

/**
 * 返回html的实际内容
 * @param realpath
 * @param propath
 * @param params
 * @returns {*}
 */
function getHtml( realpath, propath, params ) {

    if ( !fs.existsSync( realpath ) )
        return '';

    var innerhtml = '<link rel="import" href="' + propath + '?__inline" />';
    var withwrapperh = params ? ( '{% ' + params + ' %}' ) : '';
    var withwrapperf = params ? '{% endwith %}' : '';

    return withwrapperh + innerhtml + withwrapperf;
}

/**
 * 返回js的实际内容
 * @param realpath
 * @param propath
 * @param params
 */
function handleJs ( realpath, propath, params ) {

    var jscon = this;

    var innerjs = '<script type="text/javascript" src="' + propath + '?__inline"></script>';
    var withwrapperh = params ? ( '{% ' + params + ' %}' ) : '';
    var withwrapperf = params ? '{% endwith %}' : '';

    var posholder = [
        withwrapperh, innerjs, withwrapperf, scriptTag
    ].join( '\n' );

    return jscon.replace( new RegExp( scriptTag ), posholder );

}

module.exports = function( content, file, settings ) {

    scriptTag = settings.scriptTag || scriptTag;

    var matcharr;
    var targetres = content;
    while ( ( matcharr = pattern.exec( content ) ) !== null ) {
        var originitem = matcharr[ 0 ];
        var targetname = matcharr[ 2 ].trim();
        var params = matcharr[ 3 ] ? matcharr[ 3 ].trim() : null;
        // html -> js -> less
        var targethtml = targetname + '.html';
        var targetjs   = targetname + '.js';
        var targetless = targetname + '.less';
        // 真实指代路径
        var targetrealhtml = path.join( CURR_PROJECT_DIR, targethtml );
        var targetrealless = path.join( CURR_PROJECT_DIR, targetless );
        var targetrealjs = path.join( CURR_PROJECT_DIR, targetjs );

        var posholder = [
            getLess( targetrealless, targetless ),
            getHtml( targetrealhtml, targethtml, params )
        ].join( '\n' );

        // less、html
        targetres = targetres.replace( originitem, posholder );

        // js
        fs.existsSync( targetrealjs )
            && ( targetres = handleJs.call(
                targetres, targetrealjs, targetjs, params ) );

    }

    return targetres;

};