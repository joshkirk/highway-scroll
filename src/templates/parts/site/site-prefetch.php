<?php
/* --- Prefetch DNS for external assets --- */
?>
<link rel="dns-prefetch" href="https://images.prismic.io" />
<link rel="preconnect" href="https://images.prismic.io" crossorigin>
<?php
/* --- Prefetch Shopify assets --- */
if(defined("SHOPIFY_DOMAIN") && SHOPIFY_DOMAIN !== ""){
?>
<!--<link rel="dns-prefetch" href="https://cdn.shopify.com" />-->
<!--<link rel="preconnect" href="https://cdn.shopify.com" crossorigin>-->
<?php } ?>