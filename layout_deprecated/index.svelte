{@html list_posts()}

<script>
    import { getContext } from 'svelte';
    const { list_posts } = getContext('locals');
</script>