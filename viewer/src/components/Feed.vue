<template>
	<div class="feed">
        <FeedLine v-for="line in feedLines" :key="line.id" :line="line" />
    </div>
</template>
<script>
    import FeedLine from './FeedLine'
    import data from '../data/data.json'
    export default {
        name: 'Feed',
        components: { FeedLine },
        computed: {
            feedLines: function() { return this.shuffle(data); }
        },
        methods: {
            shuffle(arr) {
                return arr.map((value) => ({ value, sort: Math.random() }))
                    .sort((a, b) => a.sort - b.sort)
                    .map(({ value }) => value)
            }
        }
    }
</script>
<style>
    .feed {
        display: flex;
        flex-direction: column;
        width: 100%;
        max-width: 400px;
        margin: 0 auto;
    }
</style>
