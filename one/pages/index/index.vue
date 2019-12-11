<template>
	<view class="container" @touchstart="startSlide" @touchend="endSlide">
		<view id="">
			<image class="bg-blur" :src="image.img"></image>
			<!-- <image src="../../static/qrcode.png" class="qrcode"></image> -->
			<view class="sentence">
<!-- 				<text :style="{color: image.color}">
					{{sentence}}
				</text> -->
				<view :style="{color: image.color}">
					<view >{{sentence}}</view>
				</view>
			</view>	
		</view>

		<button class="next" @click="nextRandom">再来一碗</button>
		<button class="change-image" @click="loadRadomImage">更换背景</button>
		<button class="generate-image" @click="generateImg">生成图片</button>
		<canvas canvas-id="canvas" :style="'width:'+systemInfo.windowWidth+'px;height:'+systemInfo.windowHeight+'px;position:absolute;op:-9999px;left:-9999px;'"/>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				slideData: {
					startX: 0,
					startY: 0,
				},
				sentence: "",
				image: "",
				systemInfo: {},
			}
		},
		onLoad() {
			uni.getProvider({
			    service: 'oauth',
			    success: res => {
			        if (~res.provider.indexOf('qq')) {
						qq.showShareMenu({
						  showShareItems: ['qq', 'qzone', 'wechatFriends', 'wechatMoment']
						});	
			        }
			    }
			});
			this.getSystemInfo();
			this.loadRadomImage();
			this.loadRandomSentence();
		},
		onShare(res) {
		  return {
			title: '干了这碗毒鸡汤',
			path: '/pages/index/index'
		  }
		},
		methods: {
			startSlide(e){
				this.slideData.startX = e.changedTouches[0].clientX;
				this.slideData.startY = e.changedTouches[0].clientY;
			},
			endSlide(e){
				let subX = e.changedTouches[0].clientX-this.slideData.startX;
			    let subY = e.changedTouches[0].clientY - this.slideData.startY;
				if(subY>50 || subY<-50){
					console.log('上下滑')
				}else{
					if(subX>100){
						console.log('右滑')
					}else if(subX<-100){
						console.log('左滑');
						this.loadRandomSentence();
					}else{
						console.log('无效')
					}
				}
			},
			loadRandomSentence(){
				uni.request({
					url: this.server + '/api.php',
					method: 'GET',
					success: (res) => {
						console.log(res);
						this.sentence = res.data.content;
					}
				})
			},
			loadRadomImage(){
				uni.request({
					url: this.server + '/gs_image.php',
					method: 'GET',
					success: (res) => {
						console.log(res);
						this.image = res.data;
					}
				})				
			},
			drawImg(imgUrl){
				let context = uni.createCanvasContext('canvas')
				context.drawImage(imgUrl, 0, 0, this.systemInfo.windowWidth, this.systemInfo.windowHeight);
				context.drawImage('/static/qrcode.png', this.systemInfo.windowWidth - 100, this.systemInfo.windowHeight - 110, 80, 80);
				context.setFillStyle(this.image.color);		
				context.setFontSize(11);
				context.fillText("扫一扫查看更多", this.systemInfo.windowWidth - 100, this.systemInfo.windowHeight -15); // 画二维码下面文字
				context.fillText("干了这碗毒鸡汤", this.systemInfo.windowWidth - 100, this.systemInfo.windowHeight - 120);
				context.setFontSize(17);
				let baseHeight = (this.systemInfo.windowHeight * 0.4);
				let lineHeight = 25;
				this.drawText(baseHeight, lineHeight, context, this.sentence);
				//重点：这边本来保存图片是写在draw之后，但第一次保存时空白，第二次才生效，写在draw回调里面就OK了。
				context.draw(false, ()=>{
					uni.canvasToTempFilePath({
						canvasId:'canvas',
						width: this.systemInfo.windowWidth,
						height: this.systemInfo.windowHeight,
						destWidth: this.systemInfo.windowWidth * this.systemInfo.pixelRatio,
						destHeight: this.systemInfo.windowHeight * this.systemInfo.pixelRatio,
						success: (res)=>{
							uni.hideLoading()
							uni.saveImageToPhotosAlbum({
								filePath:res.tempFilePath,
								success : (res) => {
									uni.showToast({title : '图片已保存'})
								}
							})
						}
					})
				})
			},
			nextRandom(){
				this.loadRandomSentence();
			},
			getSystemInfo(){
				uni.getSystemInfo({
				    success: (res) => {
						this.systemInfo = res;
				    }
				});
			},
			drawText(baseHeight, lineHeight, ctx, text){
				let ww = this.systemInfo.windowWidth - 10; // 左右去除10
				let wc = this.systemInfo.windowWidth / 2; // 中心位置
				if (this.measureText(text).width < ww) {
					ctx.fillText(text, wc-(ctx.measureText(text).width/2), baseHeight);
				}
				else {
					let ct = "";
					let ctw = 0;
					let li = 0;
					for (let i=0; i<text.length; i++){
						ctw += this.measureText(text[i]);
						if (ctw > ww - 25) {
							ctx.fillText(text.substring(li, i+1), wc - (ctw / 2), baseHeight);
							li = i + 1;
							baseHeight += lineHeight;
							ctw = 0;
						}
						if (i == text.length - 1){
							ctx.fillText(text.substring(li, i+1), wc - (ctw / 2), baseHeight);
						}
					}
				}
			},
			generateImg(){
				uni.showLoading({
						title: '图片绘制中...',
				});
				uni.downloadFile({
				    url: this.image.img, //仅为示例，并非真实的资源
				    success: (res) => {
				        if (res.statusCode === 200) {
							this.drawImg(res.tempFilePath);
				        }
				    }
				});
			},
			measureText (text, fontSize=17) {
			    text = String(text);
			    var text = text.split('');
			    var width = 0;
			    text.forEach(function(item) {
			        if (/[a-zA-Z]/.test(item)) {
			            width += 7;
			        } else if (/[0-9]/.test(item)) {
			            width += 5.5;
			        } else if (/\./.test(item)) {
			            width += 2.7;
			        } else if (/-/.test(item)) {
			            width += 3.25;
			        } else if (/[\u4e00-\u9fa5]/.test(item)) {  //中文匹配
			            width += 10;
			        } else if (/\(|\)/.test(item)) {
			            width += 3.73;
			        } else if (/\s/.test(item)) {
			            width += 2.5;
			        } else if (/%/.test(item)) {
			            width += 8;
			        } else {
			            width += 10;
			        }
			    });
			    return width * fontSize / 10;
			}
		}
	}
</script>

<style>
	
	.container {
		width: 100%;
		height: 100%;	
		padding: 0;
		margin: 0;
	}
	

	.bg-blur {
		/* background-image: url('https://one-1252354013.cos.ap-chengdu.myqcloud.com/bg.jpg'); */
/*        background-size: 100% 100%;
        background-repeat:no-repeat; */
		width: 100%;
		height: 100%;	
		z-index: -1;
		padding: 0;
		margin: 0;
/* 		filter: blur(10upx);
		transform: scale(1.2); */
		bottom: 0;
		position: fixed;
	}
	
	.qrcode {
		width: 140upx;
		height: 140upx;
		position: absolute;
		top: 10%;
		right: 3%;
	}

	.sentence {
		width: 380px;
		position: absolute;
		top: 40%;
		left: 5%;
		padding: 0px;
		overflow: hidden;
		z-index: 1;
		width: 90%;
		height: 20%;
		color: #000000;
		font-size: 20;
		text-align: center;
	}

	.next {
		position: absolute;
		background: #1aaf5d;
		border: none;
		color: #fff;
		top: 78%;
		left: 30%;
		height: 70upx;
		line-height: 70upx;
		width: 40%;
		border-radius: 35px;
		outline: none;
		cursor: pointer;
		transition: all 0.5s;
		box-shadow: 2px 2px 2px #999;
	}
	
	.change-image {
		position: absolute;
		background: #1aaf5d;
		border: none;
		color: #fff;
		top: 85%;
		left: 30%;
		height: 70upx;
		line-height: 70upx;
		width: 40%;
		border-radius: 35px;
		outline: none;
		cursor: pointer;
		transition: all 0.5s;
		box-shadow: 2px 2px 2px #999;
	}
	
	.generate-image {
		position: absolute;
		background: #1aaf5d;
		border: none;
		color: #fff;
		top: 92%;
		left: 30%;
		height: 70upx;
		line-height: 70upx;
		width: 40%;
		border-radius: 35px;
		outline: none;
		cursor: pointer;
		transition: all 0.5s;
		box-shadow: 2px 2px 2px #999;
	}
	
</style>
