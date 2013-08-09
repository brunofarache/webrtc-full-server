YUI.add("webrtc",function(e,t){function a(e){a.superclass.constructor.apply(this,arguments)}var n=window.webkitRTCPeerConnection||window.mozRTCPeerConnection,r=window.mozRTCSessionDescription||window.RTCSessionDescription,i=window.mozRTCIceCandidate||window.RTCIceCandidate,s=null,o=!1,u=!0;attachMediaStream=function(e,t){if(e==null)throw new Error("The video element provided does not seem to exist. Stream can not be attached.");e.srcObject!==undefined?e.srcObject=t:e.mozSrcObject!==undefined?e.mozSrcObject=t:e.src!==undefined&&(e.src=URL.createObjectURL(t)),e.play()},navigator.webkitGetUserMedia!==undefined?(u=!0,s=navigator.webkitGetUserMedia.bind(navigator)):navigator.mozGetUserMedia!==undefined&&(o=!0,s=navigator.mozGetUserMedia.bind(navigator)),a.NAME="webrtc",e.extend(a,e.Base,{DEFAULT_STUN_SERVER:{url:"stun:stun.l.google.com:19302"},_socket:io.connect("/"),_type:"",_localStreamElement:null,_remoteStreamElements:[],_localStream:null,_remoteStreams:[],_roomId:"",_isStreaming:!1,_disconnectedMessages:[],_pcs:[],_dcs:[],_file_dcs:[],_newConnectionCallback:function(){},_downloadStatus:0,_download:"",_downloadName:"",startStream:function(e,t){var n=this;this._type=e,e==="both"||e==="media"||typeof e===undefined?n._startLocalStream(function(){n._makeConnection(t)}):n._makeConnection(t)},send:function(e,t){t=t||this._dcs;var n;for(n=0;n<t.length;n++)console.log(e),t[n]!==undefined&&t[n].send(e)},sendFile:function(e){var t=this,n=new FileReader,r=document.getElementById(e).files[0];n.onload=function(n){var i=document.getElementById(e).value.split(/(\/|\\)/).pop(),s=r.size,o=500,u=Math.ceil(s/o),a=0,f;t.send("start"+u+","+i,t._file_dcs);for(f=0;f<u;f++)setTimeout(function(){t.send(n.target.result.substring(a*o,a*o+o),t._file_dcs),a++},(f+1)*200)},n.readAsText(r)},setLocal:function(e){this._localStreamElement=document.getElementById(e)},addRemote:function(e){this._remoteStreamElements.push(document.getElementById(e))},pause:function(){this._pcs[0].removeStream(this._localStream),this._updateDescription(),this._isStreaming=!1},isStreaming:function(){return _isStreaming},resume:function(){this._pcs[0].addStream(this._localStream),this._updateDescription(),this._isStreaming=!0},mute:function(){},getId:function(){return this._roomId},setId:function(e){this._roomId=e},setIceServers:function(e){typeof e=="array"?_ice_servers=e:_ice_servers=[e]},_getLocalStream:function(){return this._localStream},_getRemoteStreams:function(){return this._remoteStreams},_startLocalStream:function(e){var t=this;s({audio:!1,video:!0},function(n){t._localStream=n,attachMediaStream(t._localStreamElement,t._localStream),e()},function(e){console.log("Error getting media device")})},_startDataChannel:function(t){var n=this;this._file_dcs[t]=this._pcs[t].createDataChannel("file",{reliable:!1}),this._file_dcs[t].onmessage=function(t){console.log("test"),console.log(t);if(n._downloadStatus>0)n._download+=t.data,n._downloadStatus--,n._downloadStatus===0&&(uriContent="data:application/octet-stream,"+encodeURIComponent(n._download),e.one("body").append('<a style="position:absolute;display:none" id="webrtc-file-download" href="'+uriContent+'" download="'+n._downloadName+'"></a>'),e.one("#webrtc-file-download").simulate("click"),e.one("#webrtc-file-download").remove(),n._download="");else if(t.data.substring(0,5)==="start"){var r=t.data.indexOf(",");n._downloadStatus=parseInt(t.data.substring(5,r),10),n._downloadName=t.data.substring(r+1)}},this._dcs[t]=this._pcs[t].createDataChannel("data",{reliable:!1}),this._dcs[t].onmessage=function(e){console.log("here"),n.fire("message",{message:e.data})}},_createConn:function(e){var t={iceServers:[this.DEFAULT_STUN_SERVER]},r=null;r={optional:[{RtpDataChannels:!0}],mandatory:{OfferToReceiveAudio:!0,OfferToReceiveVideo:!0,MozDontOfferDataChannel:!0}},this._pcs[e]=new n(t,r),this._type!=="media"&&this._startDataChannel(e),this._localStream&&this._pcs[e].addStream(this._localStream)},_makeConnection:function(e){var t=this;this._socket.on("joined",function(n){client_id=n.client_id,id=n.id,client_id!==0&&(t._createConn(0),t._updateDescription(t._pcs[0],client_id,0)),e(id)}),this._socket.on("add_desc",function(e){var n=e.from_client_id,i=e.id,s=!1;console.log(e.client_id+" <------ "+n),t._pcs[n]===undefined&&(t._createConn(n),s=!0),t._pcs[n].onaddstream=function(r){t.fire("newConnection"),t._remoteStreams[t._remoteStreams.length]=r.stream,attachMediaStream(t._remoteStreamElements[t._remoteStreamElements.length-1],r.stream),t._isStreaming=!0,e.client_id>n+1&&(t._createConn(n+1),t._updateDescription(t._pcs[n+1],e.client_id,n+1))},t._pcs[n].onicecandidate=function(r){r.candidate&&t._socket.emit("cand",{client_id:n,from_client_id:e.client_id,cand:r.candidate,id:i})},t._pcs[n].setRemoteDescription(new r(e.desc)),s&&t._pcs[n].createAnswer(function(r){t._pcs[n].setLocalDescription(r),console.log(e.client_id+" ------> "+e.from_client_id),t._socket.emit("desc",{client_id:e.from_client_id,from_client_id:e.client_id,desc:r,id:i})})}),this._socket.on("add_cand",function(e){t._pcs[e.client_id]===undefined?(cands[e.client_id]===undefined&&(cands[e.client_id]=[]),cands[e.client_id].push(e.cand)):t._pcs[e.client_id].addIceCandidate(new i(e.cand))}),this._socket.emit("join",{id:this._roomId})},_updateDescription:function(e,t,n){var r=this;e.createOffer(function(i){e.setLocalDescription(i),console.log(t+" ------> "+n),r._socket.emit("desc",{client_id:n,from_client_id:t,desc:i,id:id})},null)}}),e.WebRTC=a},"@VERSION@",{requires:["node","socket_io","event-custom","base-build","base","node-event-simulate"]});
