<template>
	<div class="feeditem" :style="style">
        <h2>{{ item.title }}</h2>
        <a :href="item.link" target="_blank">W</a>
        <p v-html="item.text"></p>
	</div>
</template>
<script>
	export default {
		name: 'FeedItem',
		props: [ 'item' ],
        computed: {
            style: function () {
                return {
                    backgroundImage: `url(${this.item.img})`
                }
            }
        }
	}
</script>
<style scoped>
	.feeditem {
        background-size: cover;
        background-position: center;
        margin: 0;
        padding: 4px;
        overflow: hidden;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        align-items: flex-start;

        height: 75vw;
        flex-basis: 75vw;
        flex-grow: 0;
        flex-shrink: 0;
        position: relative;
	}
    @media screen and (min-width: 400px) {
        .feeditem {
            height: 300px;
            flex-basis: 300px;
        }
    }
    h2, p {
        margin: 6px;
        padding: 4px;
        border-radius: 4px;
        background-color: lightgrey;
        opacity: 0.85;
    }
    a {
        position: absolute;
        top: 10px;
        right: 10px;
        padding: 10px;
        background-color: white;
        border-radius: 20px;
        width: 15px;
        height: 15px;
        text-decoration: none;
        font-weight: bold;
        z-index: 10;
    }
    p {
        text-align: center;
        max-height: 100%;
        overflow: hidden;
    }
    .feeditem:first-child > p {
        max-height: 75%;
    }
</style>
