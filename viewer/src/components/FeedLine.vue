<template>
	<div class="feedline">
        <FeedItem v-for="item in line" :key="item.id" :item="item" />
	</div>
</template>
<script>
import FeedItem from './FeedItem'
	export default {
		name: 'FeedLine',
        components: { FeedItem },
		props: [ 'line' ]
	}
</script>
<style scoped>
    .feedline {
        margin: 2px 0;
        overflow-x: scroll;
        overflow-y: hidden;
        display: flex;
    }
</style>
