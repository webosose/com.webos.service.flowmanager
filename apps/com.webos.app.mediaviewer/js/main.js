var initialData = {
    content: [{
        uri: "",
        requester: "",
        action: "",
        extra: {
            type: ""
        }
    },
    {
        uri: "",
        requester: "",
        action: "",
        extra: {
            type: ""
        }
    }],
    curDivIdx: 0
};

window.onload = function () {
    var vm = new Vue({
        el: '#app',
        data: Object.assign({}, initialData),
        methods: {
            handleClickContent: function() {
                console.log("handleClickContent");
                let subscribeStatus = false;
                let resubscribeStatus = false;
                webOS.service.request("luna://com.webos.service.applicationmanager/", {
                    method:"running",
                    parameters: {
                    },
                    onSuccess: function(inResponse) {
                        console.log("onSuccess : " + JSON.stringify(inResponse));
                    },
                    onFailure: function(inError) {
                        console.log("onFailure : " + JSON.stringify(inError));
                    },
                    onComplete: function(inResponse) {
                        // console.log("onComplete : " + JSON.stringify(inResponse));
                    },
                    subscribe: subscribeStatus,
                    resubscribe: resubscribeStatus
                });
            },
            getNextScreenIndex: function() {
                let index = (this.curDivIdx + 1) % document.getElementById('app').children.length;
                console.log("getNextScreenIndex = " + index);
                return index;
            },
            updateContent: function(index) {
                console.log("updateContent at index = " + index);
                if (PalmSystem && PalmSystem.launchParams) {
                    let p = JSON.parse(PalmSystem.launchParams);
                    Object.assign(this.content[index], p);
                }
                console.log("update contents    = " + JSON.stringify(this.content));
            },
            handleRelaunch: function() {
                console.log("handleRelaunch");
                this.updateContent(this.getNextScreenIndex());
            },
            handleLoadedData: function(index) {
                console.log("handleLoadedData - div index = " + index);
                if (this.content[index].extra.type === 'video') {
                    setTimeout(() => {
                        this.$refs.video.play();
                    }, 4000);
                }
                if (this.curDivIdx == index) {
                    return;
                }
                console.log("show loaded screen");
                let elem = document.getElementById('app');
                elem.children[this.curDivIdx].style.zIndex = "1";
                elem.children[index].style.zIndex = "11";
                
                elem.children[this.curDivIdx].style.opacity = '0';
                elem.children[index].style.opacity = '1';
                setTimeout(() => {
                    this.content[this.curDivIdx].extra.type = "";
                    this.content[this.curDivIdx].uri = "";
                    this.content[this.curDivIdx].requester = "";
                    this.content[this.curDivIdx].action = "";
                    this.curDivIdx = index;
                }, 3000);
            }
        },
        mounted: function () {
            console.log("mounted : contents = " + JSON.stringify(this.content));
            this.$refs.screen0.style.zIndex = "11";
            this.$refs.screen1.style.zIndex = "1";
            this.$refs.screen1.style.opacity = '0';

            this.updateContent(this.curDivIdx);

            document.addEventListener('webOSRelaunch', this.handleRelaunch);
        },
        beforeDestroy: function() {
            document.removeEventListener("webOSRelaunch", this.handleRelaunch);
        }
    });
}
