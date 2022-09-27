<?php
/**
 * Sharif Judge online judge
 * @file Login.php
 * @author Mohammad Javad Naderi <mjnaderi@gmail.com>
 */
defined('BASEPATH') OR exit('No direct script access allowed');

class Third_party extends CI_Controller
{

	public function __construct()
	{
		parent::__construct();
	}


	// ------------------------------------------------------------------------


	/**
	 * Run with custom action from third-party
	 */
	public function index($action = FALSE)
	{
    if (!isset($action) || !$action) {
			echo json_encode([
				"is_error" => true,
				"msg" => 'unknown.action',
			]);
		}
		// Get coefficient
    $extra_time = $this->input->get('extra_time');
    $start_time = $this->input->get('start_time');
    $finish_time = $this->input->get('finish_time');
    $rule = $this->input->get('rule');
    if (
      $action == "coefficient"
    ) {
			if (
				!isset($extra_time) ||
				!isset($start_time) ||
				!isset($finish_time) ||
				!isset($rule)
			) {
				echo json_encode([
					"is_error" => true,
					"msg" => 'coefficient.invalid-input',
				]);
				exit;
			}
			$delay = shj_now()-strtotime($finish_time);
			$submit_time = shj_now()-strtotime($start_time);
      ob_start();
			if ( eval($rule) === FALSE )
				$coefficient = "error";
			if (!isset($coefficient))
				$coefficient = "error";
			ob_end_clean();
			$finished = ($start_time < $finish_time &&  $delay > $extra_time);
			echo json_encode([
				"delay" => $delay,
				"submit_time" => $submit_time,
				"coefficient" => $coefficient,
				"finished" => $finished
			]);
      exit;
    }
		if ($action === "settings") {
			$settings = $this->settings_model->get_all_settings();
			echo json_encode($settings);
			exit;
		}
		if ($action === "accounts") {
			$accounts = $this->user_model->get_all_users();
			echo json_encode($accounts);
			exit;
		}
		if ($action === "assignments") {
			$accounts = $this->assignment_model->third_party_assignments();
			echo json_encode($accounts);
			exit;
		}
		if ($action === "problems") {
			$accounts = $this->problem_model->third_party_problems();
			echo json_encode($accounts);
			exit;
		}
		if ($action === "languages") {
			$lang = $this->language_model->third_party_languages();
			echo json_encode($lang);
			exit;
		}
    echo json_encode([
			"is_error" => true,
			"msg" => 'unknown.action'
		]);
	}
}
