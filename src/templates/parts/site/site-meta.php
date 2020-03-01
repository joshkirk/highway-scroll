<?php
// default image
$fb_img = PROTOCOL . HOST . "/assets/images/meta/facebook-share.png";
$tw_img = PROTOCOL . HOST . "/assets/images/meta/twitter-share.png";
// grab Featured Image from page 
$settings = getByUID("site_settings");
/* --------------- *
echo "<br><pre>";
print_r($settings);
echo "</pre>";
/* --------------- */
if(isset($WPGLOBAL["document"]) && isset($WPGLOBAL["document"]->data->meta_image->url)){
	$fb_img = $WPGLOBAL["document"]->data->meta_image->url;
	$tw_img = $WPGLOBAL["document"]->data->meta_image->url;
}
?>
<meta name="description" content="<?php echo $description; ?>" />
<?php /* --- Facebook --- */ ?>
<meta property="og:description" content="<?php echo $description; ?>" /> 
<meta property="og:image" content="<?php echo $fb_img; ?>" />
<meta property="og:site_name" content="" />
<meta property="og:title" content="<?php echo $title; ?>" />
<meta property="og:type" content="website" />
<meta property="og:url" content="<?php echo PROTOCOL . HOST . URI; ?>" />
<?php if(isset($settings->data)){ ?>
<meta property="fb:app_id" content="<?php echo $settings->data->fb_app_id; ?>" />
<?php } ?>
<?php /* --- Twitter --- */ ?>
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:creator" content="" />
<meta name="twitter:description" content="<?php echo $description; ?>" />
<meta name="twitter:image" content="<?php echo $tw_img; ?>" />
<meta name="twitter:site" content="<?php echo PROTOCOL . HOST . URI; ?>" />
<meta name="twitter:title" content="<?php echo $title; ?>" />
<?php if(isset($settings->data) && isset($settings->data->favicon->url)){ ?>
<?php /* --- Standard Icons --- */ ?>
<link rel="icon" type="image/png" sizes="32x32" href="<?php echo $settings->data->favicon->{"32x32"}->url; ?>" /><?php // Standard for most desktop browsers ?>
<link rel="icon" type="image/png" sizes="57x57" href="<?php echo $settings->data->favicon->{"57x57"}->url; ?>" /><?php // Standard iOS home screen ?>
<link rel="icon" type="image/png" sizes="76x76" href="<?php echo $settings->data->favicon->{"76x76"}->url; ?>" /><?php // iPad home screen icon ?>
<link rel="icon" type="image/png" sizes="96x96" href="<?php echo $settings->data->favicon->{"96x96"}->url; ?>" /><?php // GoogleTV icon ?>
<link rel="icon" type="image/png" sizes="128x128" href="<?php echo $settings->data->favicon->{"128x128"}->url; ?>" /><?php // Chrome Web Store icon & Small Windows 8 Star Screen Icon ?>
<link rel="icon" type="image/png" sizes="192x192" href="<?php echo $settings->data->favicon->{"192x192"}->url; ?>" /><?php // Google Developer Web App Manifest Recommendation ?>
<?php /* --- Android Icons --- */ ?>
<link rel="icon" type="image/png" sizes="196x196" href="<?php echo $settings->data->favicon->{"196x196"}->url; ?>" /><?php // Chrome for Android home screen icon ?>
<?php /* --- iOS Icons --- */ ?>
<link rel="apple-touch-icon" sizes="120x120" href="<?php echo $settings->data->favicon->{"120x120"}->url; ?>" /><?php // iPhone retina touch icon ?>
<link rel="apple-touch-icon" sizes="152x152" href="<?php echo $settings->data->favicon->{"152x152"}->url; ?>" /><?php // iPad touch icon ?>
<link rel="apple-touch-icon" sizes="180x180" href="<?php echo $settings->data->favicon->{"180x180"}->url; ?>" /><?php // iPhone 6 plus ?>
<?php /* --- Windows Icons --- */ ?>
<meta name="application-name" content="&nbsp;"/>
<meta name="msapplication-TileColor" content="#FFFFFF" />
<meta name="msapplication-TileImage" content="<?php echo $settings->data->favicon->{"144x144"}->url; ?>" /><?php // IE10 Metro tile for pinned site ?>
<meta name="msapplication-square70x70logo" content="<?php echo $settings->data->favicon->{"70x70"}->url; ?>" />
<meta name="msapplication-square150x150logo" content="<?php echo $settings->data->favicon->{"150x150"}->url; ?>" />
<meta name="msapplication-wide310x150logo" content="<?php echo $settings->data->favicon->{"310x150"}->url; ?>" />
<meta name="msapplication-square310x310logo" content="<?php echo $settings->data->favicon->{"310x310"}->url; ?>" />
<?php } ?>
<?php /* --- Robots Tag --- */ ?>
<?php if(strpos(HOST, "staging") !== false){ ?>
<meta name="robots" content="noindex, nofollow, noimageindex, noarchive, nosnippet" />
<?php } ?>