/**
 * Created by pc on 2018/9/3.
 */
$(function(){
    initselect("select")
})
function initselect(id){
    $('#'+id).selectpicker({
        size: 10,
        width:'100%'
    });
}