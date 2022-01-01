<!DOCTYPE html>
<html lang="zh">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body>
{@html body}
</body>
</html>
<script>
    import { getContext } from 'svelte';
    const { body } = getContext('locals');
</script>