<template>
    <article id="page-notfound" class="page">
        Not Found
    </article>
</template>
<script>
    export default {
        data(){
            return {
                site:window.Site,
                lang:window.Site.lang ? window.Site.lang.website : {},
                architect: Site.architect ? Architect.getStartingBlock() : {},
            };
        },
        methods:{

        },
        created(){

        },
        mounted(){

        }
    }
</script>